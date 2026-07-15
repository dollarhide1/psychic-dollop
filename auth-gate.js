/* Tender Days — sign-in (6-digit email code) + subscription gate.
   Requires the Supabase UMD script and config.js to be loaded first. */
(function () {
  var cfg = window.TENDER_CONFIG || {};
  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("YOUR-") !== -1) {
    console.warn("Tender Days: add your Supabase URL and anon key to config.js");
  }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  var gate = document.getElementById("authGate");
  var views = ["gateLoading", "gateSignin", "gateCode", "gateSubscribe"];
  var currentEmail = "";

  function show(id) {
    views.forEach(function (v) {
      var el = document.getElementById(v);
      if (el) el.hidden = (v !== id);
    });
    gate.hidden = false;
    document.body.classList.add("gated");
  }
  function unlock() {
    gate.hidden = true;
    document.body.classList.remove("gated");
  }

  async function checkAccess(retries) {
    show("gateLoading");
    var sess = (await sb.auth.getSession()).data.session;
    if (!sess) { show("gateSignin"); return; }

    // populate the in-app "My account" panel
    var ae = document.getElementById("acctEmail");
    if (ae) ae.textContent = sess.user.email;

    var res = await sb.from("subscriptions").select("status")
      .eq("user_id", sess.user.id).maybeSingle();
    var status = res.data && res.data.status;
    if (status === "active" || status === "trialing") { unlock(); return; }

    var params = new URLSearchParams(location.search);
    if (params.get("checkout") === "success" && (retries || 0) < 6) {
      show("gateLoading");
      setTimeout(function () { checkAccess((retries || 0) + 1); }, 2500);
      return;
    }
    var em = document.getElementById("gateEmail2");
    if (em) em.textContent = sess.user.email;
    show("gateSubscribe");
  }

  // Step 1: request a 6-digit code by email
  document.getElementById("gateSendCode").addEventListener("click", async function () {
    var email = document.getElementById("gateEmailInput").value.trim();
    if (!email) return;
    var btn = this; btn.disabled = true; btn.textContent = "Sending…";
    var out = await sb.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: true }
    });
    btn.disabled = false; btn.textContent = "Email me a code";
    if (out.error) { alert(out.error.message); return; }
    currentEmail = email;
    document.getElementById("codeEmail").textContent = email;
    show("gateCode");
    var ci = document.getElementById("gateCodeInput");
    if (ci) { ci.value = ""; ci.focus(); }
  });

  // Step 2: verify the 6-digit code
  async function verifyCode() {
    var token = (document.getElementById("gateCodeInput").value || "").trim();
    if (token.length < 6) return;
    var btn = document.getElementById("gateVerifyBtn");
    btn.disabled = true; btn.textContent = "Verifying…";
    var out = await sb.auth.verifyOtp({ email: currentEmail, token: token, type: "email" });
    btn.disabled = false; btn.textContent = "Verify code";
    if (out.error) {
      var err = document.getElementById("codeError");
      if (err) err.textContent = "That code didn't work — check it and try again.";
      return;
    }
    checkAccess();
  }
  document.getElementById("gateVerifyBtn").addEventListener("click", verifyCode);
  document.getElementById("gateCodeInput").addEventListener("keydown", function (e) {
    if (e.key === "Enter") verifyCode();
  });

  // Resend / change email
  document.getElementById("gateResend").addEventListener("click", function (e) {
    e.preventDefault();
    show("gateSignin");
  });

  // Start trial / subscribe
  document.getElementById("gateSubscribeBtn").addEventListener("click", async function () {
    var btn = this; btn.disabled = true; btn.textContent = "Opening secure checkout…";
    var out = await sb.functions.invoke("create-checkout-session");
    if (out.error || !(out.data && out.data.url)) {
      btn.disabled = false; btn.textContent = "Start my 7-day free trial";
      alert((out.error && out.error.message) || "Something went wrong. Please try again.");
      return;
    }
    location.href = out.data.url;
  });

  // Manage subscription (Stripe portal) — gate screen button and in-app "My account" button
  function openPortal(btn) {
    return async function () {
      if (btn) { btn.disabled = true; }
      var out = await sb.functions.invoke("create-portal-session");
      if (btn) { btn.disabled = false; }
      if (out.data && out.data.url) { location.href = out.data.url; }
      else { alert((out.error && out.error.message) || "Couldn't open the billing page. Please try again."); }
    };
  }
  var mng = document.getElementById("gateManage");
  if (mng) mng.addEventListener("click", openPortal(mng));
  var mng2 = document.getElementById("manageSub");
  if (mng2) mng2.addEventListener("click", openPortal(mng2));

  // Sign out
  document.querySelectorAll(".gate-signout").forEach(function (b) {
    b.addEventListener("click", async function (e) {
      e.preventDefault();
      await sb.auth.signOut();
      location.reload();
    });
  });

  checkAccess();
})();

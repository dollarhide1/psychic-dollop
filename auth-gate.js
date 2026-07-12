/* Tender Days — sign-in + subscription gate.
   Requires the Supabase UMD script and config.js to be loaded first. */
(function () {
  var cfg = window.TENDER_CONFIG || {};
  if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.indexOf("YOUR-") !== -1) {
    console.warn("Tender Days: add your Supabase URL and anon key to config.js");
  }
  var sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  var gate = document.getElementById("authGate");
  var views = ["gateLoading", "gateSignin", "gateSent", "gateSubscribe"];
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

    var res = await sb.from("subscriptions").select("status")
      .eq("user_id", sess.user.id).maybeSingle();
    var status = res.data && res.data.status;

    if (status === "active" || status === "trialing") { unlock(); return; }

    // Right after returning from Stripe the webhook may lag a few seconds.
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

  // Magic-link sign in
  document.getElementById("gateSendLink").addEventListener("click", async function () {
    var email = document.getElementById("gateEmailInput").value.trim();
    if (!email) return;
    var btn = this; btn.disabled = true; btn.textContent = "Sending…";
    var out = await sb.auth.signInWithOtp({
      email: email,
      options: { emailRedirectTo: location.origin + "/app.html" }
    });
    btn.disabled = false; btn.textContent = "Email me a sign-in link";
    if (out.error) { alert(out.error.message); return; }
    document.getElementById("sentEmail").textContent = email;
    show("gateSent");
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

  // Manage subscription (Stripe portal)
  var mng = document.getElementById("gateManage");
  if (mng) mng.addEventListener("click", async function () {
    var out = await sb.functions.invoke("create-portal-session");
    if (out.data && out.data.url) location.href = out.data.url;
  });

  // Sign out
  document.querySelectorAll(".gate-signout").forEach(function (b) {
    b.addEventListener("click", async function (e) {
      e.preventDefault();
      await sb.auth.signOut();
      location.reload();
    });
  });

  sb.auth.onAuthStateChange(function (_evt, _session) { /* handled on load */ });
  checkAccess();
})();

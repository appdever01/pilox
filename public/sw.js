if (!self.define) {
  let e,
    s = {};
  const c = (c, a) => (
    (c = new URL(c + ".js", a).href),
    s[c] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = c), (e.onload = s), document.head.appendChild(e);
        } else (e = c), importScripts(c), s();
      }).then(() => {
        let e = s[c];
        if (!e) throw new Error(`Module ${c} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, i) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let t = {};
    const u = (e) => c(e, n),
      r = { module: { uri: n }, exports: t, require: u };
    s[n] = Promise.all(a.map((e) => r[e] || u(e))).then((e) => (i(...e), t));
  };
}
define(["./workbox-3cafb6cd"], function (e) {
  "use strict";
  importScripts("fallback-6mz915cKyMGzuZ27Ck-A-.js"),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "3bf7c437f401932e6064e6519c2b9538",
        },
        {
          url: "/_next/static/6mz915cKyMGzuZ27Ck-A-/_buildManifest.js",
          revision: "b63e6701eeea71cb7e9d71eefdb4fd77",
        },
        {
          url: "/_next/static/6mz915cKyMGzuZ27Ck-A-/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/1064-24c1e030d62f8540.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/1186-62a58fed656c146d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/1442-15685266d4330196.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/1517-3dfec2a959e81d34.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/1538-5784f31e40376843.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/164f4fb6-ad49e8d22fa2e20b.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/208-9930d262b491269e.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/2640-e5c7e6eb82c56af9.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/2931.3a73b2612878bbfe.js",
          revision: "3a73b2612878bbfe",
        },
        {
          url: "/_next/static/chunks/3501-7f078ac98eb52d64.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/3676-acf9b0c7e06c1001.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/3756.87b75b1e9f03a562.js",
          revision: "87b75b1e9f03a562",
        },
        {
          url: "/_next/static/chunks/3885-87efde3676659822.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/4575-236da728a0f651e2.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/4916-34da76da0c356409.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/4bd1b696-f238bdd63a9d20df.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/5441-600aadea7b23e6e9.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/5565-13ca6f1077286128.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/5716-c1f33f065a3816a3.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/6172-ce3660b6c2427cca.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/6218-737846a319ba25ce.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/6721-a62bbe21832bdb44.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/6739d4d0-ba276490a7615772.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/6896-8b3134f20f016c1a.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/69b09407-0ba543b742f2f687.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/7291-adc93bdf04543830.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/740-2fa13b520d8e7ef5.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/7683-46f9604015f84a8e.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/7a49ec60-d923f3cbe9f17371.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/814-34034b6ef1ecbe5c.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/8173-b9338a2728da8c0c.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/8451-73262ed9c1031533.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/9253-9c09bf748038721d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/938157b5-9014c9e5d812680d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/9467-56cd019806538843.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/9633-1923ae3aa2160466.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/9768-d0969cfd022a867b.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/9927-6f4b9881f0ebd2a4.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/ad2866b8.ee5588e8eda62a42.js",
          revision: "ee5588e8eda62a42",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-8b7d30992894b138.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/api/convert/route-14514be6493ce2f4.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/chat/layout-a6932340eaa6b721.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/chat/page-f8bc88a778fe6721.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/convert-documents/layout-bdd096507b24bc1e.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/convert-documents/page-8c3238c5316b15c1.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/credit-history/layout-edf0dae474f56b56.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/credit-history/page-523f41a7304b243d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/feedback-history/page-433f70c0f37e8f0a.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/feedback/layout-a6a698ffd5b6b834.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/feedback/page-e35081e55fcbd4e0.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/forgot-password/page-7040509f8cd39603.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/generate-pdf/layout-64df1414634060f2.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/generate-pdf/page-78d2f4ba63041e67.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/images-to-pdf/layout-d4534b02a64228d6.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/images-to-pdf/page-a1dbb2d27a885c29.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/latex-renderer/page-4c6561f302bd5ac1.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/layout-af8abcf8d04c57bd.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/loading-97dd0537f11c4a7f.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/login/page-7d17e9d829507181.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/not-found-009cbdad8af11c47.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/offline/page-2e0e266da44ee257.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/page-fb3b770ec4647801.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/pdf-to-images/layout-c57e39ff2037f339.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/pdf-to-images/page-4065178e281ad224.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/pdf-viewer/page-fa9bb86374cf481d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/pricing/layout-471a59d85fd671f7.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/pricing/page-df9c2e96fd9b033e.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/privacy/page-4343febe6e92f72b.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/rearrange-pdf/layout-5f7461ba71d177e5.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/rearrange-pdf/page-dd5da3576d6651f4.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/referrals/layout-7e0baa463afe566d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/referrals/page-94244c68939cdf8c.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/reset-password/%5Btoken%5D/page-ac1a0b8aed608fc9.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/reset-password/layout-33b1bde4129f9584.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/settings/layout-aea18e1de617c711.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/settings/page-1ea4b644428b26d4.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/signup/%5Breferral%5D/page-aec90a8f1f220061.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/signup/layout-de67490c65cdb86c.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/signup/page-7d1b386bd1a2050d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/terms/page-51a5579550cf4c14.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/verify-email/%5Btoken%5D/page-06f272a0dc944ea6.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/verify-email/layout-bd30360e49869d80.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/verify-email/page-8b2c7f051d7e7cf9.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/wagwan/admin/layout-4d76fff75595d96d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/wagwan/admin/page-27298947a40008fb.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/youtube-chat/layout-46b343a0220ec2f1.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/app/youtube-chat/page-78071fc33942dcfd.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/bc98253f.65b3681f95bcf29f.js",
          revision: "65b3681f95bcf29f",
        },
        {
          url: "/_next/static/chunks/framework-1ec85e83ffeb8a74.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/main-0ea8f4c9bcf7967e.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/main-app-e5e5ff4a9726187f.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/pages/_app-5f03510007f8ee45.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/pages/_error-8efa4fbf3acc0458.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-be2d3d5b52e5662d.js",
          revision: "6mz915cKyMGzuZ27Ck-A-",
        },
        {
          url: "/_next/static/css/6479186bee7d9e7e.css",
          revision: "6479186bee7d9e7e",
        },
        {
          url: "/_next/static/css/d326ab65dae476ab.css",
          revision: "d326ab65dae476ab",
        },
        {
          url: "/_next/static/css/d6d8c8a0433202ce.css",
          revision: "d6d8c8a0433202ce",
        },
        {
          url: "/_next/static/media/8de40de8211748f7-s.p.woff2",
          revision: "50b671c0a2e824fd892cc7c65b92de79",
        },
        {
          url: "/_next/static/media/e292f8757ca3fb64-s.woff2",
          revision: "036a7f05201344da8e877b8b8716acab",
        },
        {
          url: "/audio/sample1.mp3",
          revision: "9bed5d14e94a5f50c1aab3d509d48870",
        },
        {
          url: "/audio/sample10.mp3",
          revision: "5e438519a441af8c64725da1b0e42a8b",
        },
        {
          url: "/audio/sample2.mp3",
          revision: "74714d2b4bb0ae8c2d3537432904ce82",
        },
        {
          url: "/audio/sample3.mp3",
          revision: "a5dee5f11d4852d754b469b7c10b5b8b",
        },
        {
          url: "/audio/sample4.mp3",
          revision: "db460810cf5c8505e897f22bc109c7f3",
        },
        {
          url: "/audio/sample5.mp3",
          revision: "6c3f9047d325026a696686f902145a20",
        },
        {
          url: "/audio/sample6.mp3",
          revision: "8a035846ffb8aaf4939922551b4b8ec2",
        },
        {
          url: "/audio/sample7.mp3",
          revision: "d96f090bff134f58a56a7d7f8bd39655",
        },
        {
          url: "/audio/sample8.mp3",
          revision: "88b0cac39e9fa3c3602c135c090084f7",
        },
        {
          url: "/audio/sample9.mp3",
          revision: "f798ffc3933ebf9d88a58ecb1bd0a10b",
        },
        { url: "/favicon.png", revision: "4404ebb64db5df1da77950efd9d638f4" },
        {
          url: "/feature_banner.jpg",
          revision: "35922c7f0bf28727d822dc194d11b8a1",
        },
        {
          url: "/google_icon.png",
          revision: "792155e27bbf9daf924239566748d819",
        },
        {
          url: "/icons/128x128.png",
          revision: "cfd3f2bf02d349b3735ddd34d202c339",
        },
        {
          url: "/icons/144x144.png",
          revision: "9affe85cd3eace3c9eb8f3df3060aa25",
        },
        {
          url: "/icons/152x152.png",
          revision: "8ecbc6fbc61223cf2764881a7142b594",
        },
        {
          url: "/icons/192x192.png",
          revision: "f7a32ca169cf5df31671298704622e87",
        },
        {
          url: "/icons/384x384.png",
          revision: "2bced6ff420b891b37985c902393c937",
        },
        {
          url: "/icons/512x512.png",
          revision: "3c6e17c4e5f85751abd762c69bb8b5a1",
        },
        {
          url: "/icons/72x72.png",
          revision: "64772af6e0100d748399a4315d76912f",
        },
        {
          url: "/icons/96x96.png",
          revision: "c18b11bfd531011cf8748135bab45c2c",
        },
        {
          url: "/login_banner.jpg",
          revision: "a38ad1a924c87c110c7670efb0066574",
        },
        { url: "/logo.png", revision: "cdd0d29dd0d0a2a664d4dea702938d07" },
        {
          url: "/logo_white.png",
          revision: "4a4ebf2c3bd5c4c21e5e1c1b9368c9dc",
        },
        { url: "/manifest.json", revision: "4c22b7deaf0a4ad18d79f3cd1d05f26a" },
        { url: "/offline", revision: "6mz915cKyMGzuZ27Ck-A-" },
        {
          url: "/password_banner.jpg",
          revision: "e46d107f33ce11665da5d4acbd40ac5c",
        },
        { url: "/paypal.png", revision: "92a1e27e5bdde27b89551a38dd40c2b2" },
        { url: "/paystack.png", revision: "4a7ac4e8e0a890715d732e007a79864d" },
        {
          url: "/pdf.worker.min.js",
          revision: "1b21a52673403baa815d90e3c9347714",
        },
        { url: "/pilox-bg.png", revision: "eaa992f2c5086a4a9c5c9ca19e6fdf63" },
        { url: "/pilox.png", revision: "07255a6893dc79d7bfcca7b887ad6018" },
        {
          url: "/reset_banner.jpg",
          revision: "66d96ed70c430d25db0b19f4b9b03943",
        },
        {
          url: "/signup_banner.jpg",
          revision: "0888ff1d2de4e2e4b2399e6bf7644199",
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: c,
              state: a,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
      new e.CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 31536e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:png|jpg|jpeg|svg|gif)$/,
      new e.CacheFirst({
        cacheName: "images",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 2592e3 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/api\.pilox\.chat/,
      new e.NetworkFirst({
        cacheName: "api-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 }),
          { handlerDidError: async ({ request: e }) => self.fallback(e) },
        ],
      }),
      "GET"
    );
});

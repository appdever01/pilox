export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/5">
      <div className="container max-w-4xl py-20 px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Last updated: January 13, 2025
          </p>
        </div>

        <div className="bg-card/50 rounded-xl p-6 mb-12 backdrop-blur-sm border border-border/50">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#information-collection">Information Collection</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#document-handling">Document Handling</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#data-security">Data Security</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#user-rights">User Rights</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#cookies">Cookies & Tracking</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#third-party">Third-Party Services</a>
            </li>
          </ul>
        </div>

        <div className="space-y-16">
          <section id="information-collection" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">01.</span>
                </span>
                Information Collection
              </h2>
              <div className="prose prose-gray max-w-none space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Account Information</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Email address for account management</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Profile information (optional)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Payment information (processed securely)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Credit usage history</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Usage Data</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Device and browser information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Feature usage statistics</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Error reports and performance data</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="document-handling" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">02.</span>
                </span>
                Document Handling
              </h2>
              <div className="prose prose-gray max-w-none space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Document Processing</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Temporary storage for processing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Secure file transmission</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Automatic file deletion after processing</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Data Retention</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>24-hour temporary storage for free users</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Customizable storage for premium users</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Secure cloud storage options</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="data-security" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">03.</span>
                </span>
                Data Security
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The security of your data is important to us. We implement
                  industry-standard security measures to protect your personal
                  information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">
                      Security Measures
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>End-to-end encryption</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Regular security audits</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Secure data storage</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Data Retention</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Temporary file storage</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Account deletion options</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Data export capabilities</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="user-rights" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">04.</span>
                </span>
                User Rights
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  You have certain rights regarding your personal data. This
                  section explains your rights, how to exercise them, and how
                  we handle your requests.
                </p>
              </div>
            </div>
          </section>

          <section id="cookies" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">05.</span>
                </span>
                Cookies & Tracking
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Cookies and tracking technologies are used to improve your
                  experience on our website. This section explains what cookies
                  we use, how we use them, and how you can control them.
                </p>
              </div>
            </div>
          </section>

          <section id="third-party" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">06.</span>
                </span>
                Third-Party Services
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We may use third-party services to enhance our website and
                  services. This section explains what third-party services we
                  use, how they are used, and how we ensure their security.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Privacy Policy | PILOX",
  description: "Privacy policy and data handling practices for PILOX document tools and AI assistant.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/5">
      <div className="container max-w-4xl py-20 px-4 md:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent mb-4">
            Terms of Service
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
              <a href="#acceptance">Acceptance of Terms</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#services">Services Description</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#credits">Credits & Payments</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#user-content">User Content</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#referrals">Referral Program</a>
            </li>
            <li className="flex items-center space-x-2 hover:text-primary transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <a href="#limitations">Limitations</a>
            </li>
          </ul>
        </div>

        <div className="space-y-16">
          <section id="acceptance" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">01.</span>
                </span>
                Acceptance of Terms
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  By accessing or using PDFX services, you agree to be bound by these Terms of Service. Our services include PDF processing, AI-powered analysis, document conversion, and related features.
                </p>
                <div className="grid gap-6">
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-4">Service Access Requirements</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Must be at least 18 years old to use premium features</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Valid email required for account registration</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Responsible for maintaining account security</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="services" className="scroll-mt-20">
            <div className="bg-card/30 rounded-xl p-8 backdrop-blur-sm border border-border/50">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-primary/10 rounded-lg p-2 mr-3">
                  <span className="text-primary">02.</span>
                </span>
                Services Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Free Features</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>LaTeX Renderer</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Basic PDF to Images conversion</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Document Format Conversion</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>PDF Rearrangement</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-background/50 p-6 rounded-lg border border-border/50">
                    <h3 className="text-lg font-medium mb-3">Premium Features</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>AI PDF Generation (2 credits)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>PDF Analysis & Chat (2 credits)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Quiz Generation (2 credits)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2"></span>
                        <span>Video Explanations (3 credits)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Continue with Credits & Payments, User Content, Referral Program, and Limitations sections */}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Terms of Service | PDFX",
  description: "Terms of service and usage guidelines for PDFX document tools and AI assistant.",
};

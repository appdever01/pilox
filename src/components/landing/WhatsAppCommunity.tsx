import { MessageSquare, Users, Zap, ArrowRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

export function WhatsAppCommunity() {
  return (
    <section className="py-16 px-8 md:px-14 mt-12 mb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <Users className="w-4 h-4" />
              <span>Join Our Community</span>
            </div>

            <h2 className="text-4xl font-bold text-gray-900">
              Connect with PDF Enthusiasts in Our WhatsApp Community
            </h2>

            <p className="text-lg text-gray-600">
              Join our vibrant community of PDF power users. Share insights, get
              instant help, and stay updated with the latest PDF tips and
              tricks.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Real-time Support
                  </h3>
                  <p className="text-gray-600">
                    Get instant answers from experts and fellow users
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Exclusive Updates
                  </h3>
                  <p className="text-gray-600">
                    Be the first to know about new features and tips
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://chat.whatsapp.com/IMfN33ZuDxtD9obAkAPhYy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all group"
            >
              <FontAwesomeIcon icon={faWhatsapp} className="w-5 h-5" />
              Join Community
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Right Content - Preview */}
          <div className="relative">
            <div className="absolute -top-6 -right-6 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <img src="/pilox.png" alt="PILOX" className="rounded-full" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    pilox.com.ng 📃💬🩷
                  </h3>
                  <p className="text-sm text-gray-500">1,234 members</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    "🎉 New Feature Alert: We've just launched our YouTube video analysis feature! Chat with any YouTube video and get instant summaries, key points, and insights. Try it out! 🎥✨"
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    "💡 Earn Free Credits: Share your feedback or report bugs to earn 10 FREE credits for each validated submission! Help us improve while you earn. 🎁"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

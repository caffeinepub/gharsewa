import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const services = [
  { icon: "🧹", label: "Cleaning", color: "bg-terracotta text-white" },
  { icon: "🔧", label: "Plumbing", color: "bg-mustard text-white" },
  { icon: "🎨", label: "Painting", color: "bg-terracotta text-white" },
  { icon: "⚡", label: "Electrical", color: "bg-mustard text-white" },
  { icon: "📦", label: "Moving", color: "bg-terracotta text-white" },
];

const steps = [
  {
    num: "01",
    title: "Post Your Request",
    desc: "Describe what you need, set urgency and drop your offer price in NRs.",
    icon: <Home className="w-6 h-6" />,
  },
  {
    num: "02",
    title: "Provider Responds",
    desc: "Nearby service providers receive instant notification and can accept your offer.",
    icon: <Zap className="w-6 h-6" />,
  },
  {
    num: "03",
    title: "Job Done & Pay",
    desc: "Service completed? Rate the provider and pay securely via eSewa, Khalti, or mobile banking.",
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Kathmandu",
    text: "Found a cleaner within 15 minutes! Amazing service, highly recommend GharSewa.",
    rating: 5,
  },
  {
    name: "Bikash Thapa",
    location: "Lalitpur",
    text: "The plumber was professional and arrived quickly. Payment via eSewa was seamless.",
    rating: 5,
  },
  {
    name: "Sunita Gurung",
    location: "Bhaktapur",
    text: "Urgent painting job done in a day. Competitive pricing and great quality work!",
    rating: 4,
  },
];

export default function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen pattern-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-beige/95 backdrop-blur-sm border-b border-border shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/gharsewa-logo-icon.dim_80x80.png"
              alt="GharSewa"
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-xl text-terracotta tracking-tight">
              GHARSEWA
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
            <a
              href="#how-it-works"
              className="hover:text-terracotta transition-colors"
              data-ocid="nav.link"
            >
              How it Works
            </a>
            <a
              href="#services"
              className="hover:text-terracotta transition-colors"
              data-ocid="nav.link"
            >
              Services
            </a>
            <a
              href="#payment"
              className="hover:text-terracotta transition-colors"
              data-ocid="nav.link"
            >
              Payment
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="border-terracotta text-terracotta hover:bg-terracotta hover:text-white transition-colors"
              data-ocid="header.login_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Login / Register"
              )}
            </Button>
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="hidden md:flex bg-terracotta hover:bg-terracotta/90 text-white"
              data-ocid="header.provider_button"
            >
              Become a Provider
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-mustard/15 text-mustard px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" /> Nepal&apos;s Fastest Home Services
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-mustard leading-tight mb-4">
              घर सेवा
              <br />
              <span className="text-foreground">At Your Doorstep</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Post your home service request, set your price, and connect with
              trusted providers in minutes — not days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="bg-terracotta hover:bg-terracotta/90 text-white font-semibold px-8 shadow-card"
                data-ocid="hero.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                className="border-border text-foreground hover:border-terracotta hover:text-terracotta"
                data-ocid="hero.secondary_button"
              >
                I&apos;m a Provider
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border">
              {[
                { val: "500+", label: "Providers" },
                { val: "2,000+", label: "Jobs Done" },
                { val: "4.8★", label: "Avg Rating" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-terracotta">
                    {s.val}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="relative">
              <img
                src="/assets/generated/gharsewa-hero.dim_800x600.jpg"
                alt="GharSewa Home Services"
                className="w-full rounded-2xl shadow-card object-cover"
                style={{ maxHeight: "420px" }}
              />
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-terracotta/10 flex items-center justify-center text-xl">
                  🧹
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Urgent:</p>
                  <p className="font-semibold text-sm">Cleaning Request</p>
                  <p className="text-xs text-terracotta font-medium">
                    NRs 800 — Accepted!
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-card p-3 text-center">
                <div className="text-2xl font-bold text-mustard">20</div>
                <div className="text-xs text-muted-foreground">
                  Min avg
                  <br />
                  response
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Popular Services
            </h2>
            <p className="text-muted-foreground">
              Everything you need, right when you need it
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {services.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`flex flex-col items-center gap-2 px-6 py-4 rounded-xl cursor-pointer shadow-xs border border-border hover:shadow-card transition-shadow ${
                  i % 2 === 0 ? "bg-terracotta text-white" : "bg-white"
                }`}
                onClick={login}
              >
                <span className="text-3xl">{s.icon}</span>
                <span
                  className={`font-semibold text-sm ${i % 2 === 0 ? "text-white" : "text-foreground"}`}
                >
                  {s.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Simple, fast, and reliable in 3 steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-card border border-border hover:shadow-card-hover transition-shadow">
                  <div className="text-5xl font-black text-terracotta/10 mb-2">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 z-10 text-border">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section id="payment" className="py-16 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Secure Payment Methods</h2>
          <p className="text-muted-foreground mb-10">
            Pay conveniently with Nepal&apos;s trusted platforms
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center font-bold text-green-600 text-sm">
                eSewa
              </div>
              <span className="font-semibold">eSewa</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm">
                K
              </div>
              <span className="font-semibold">Khalti</span>
            </div>
            <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-2xl shadow-card border border-border">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                Bank
              </div>
              <span className="font-semibold">Mobile Banking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-card border border-border"
              >
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= t.rating ? "fill-mustard text-mustard" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 terracotta-gradient">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 mb-8">
            Join thousands of Nepali households using GharSewa every day.
          </p>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-white text-terracotta hover:bg-white/90 font-semibold px-8"
              data-ocid="cta.primary_button"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              Book a Service
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="border-white text-white hover:bg-white/10"
              data-ocid="cta.secondary_button"
            >
              Join as Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer-bg text-footer-text py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl text-terracotta">
                GHARSEWA
              </span>
              <span className="text-footer-text/50">•</span>
              <span className="text-sm">
                Nepal&apos;s Home Services Platform
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Shield className="w-4 h-4 text-mustard" />
              <span>Trusted &amp; Secure Payments</span>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-xs text-footer-text/50">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-footer-text transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

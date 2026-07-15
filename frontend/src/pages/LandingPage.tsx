import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BarChart3,
  ShoppingCart,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Star,
  Activity
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as const } }),
};

// --- DATA ---
const BENTO_FEATURES = [
  {
    icon: Package,
    title: "Real-time Inventory",
    desc: "Track stock levels instantly across unlimited warehouses with automated alerts.",
    colSpan: "lg:col-span-2",
  },
  {
    icon: ShoppingCart,
    title: "Order Lifecycle",
    desc: "End-to-end purchase and sales order tracking.",
    colSpan: "lg:col-span-1",
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    desc: "Deep insights into revenue and profit margins.",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    desc: "Role-based access control and detailed audit logs.",
    colSpan: "lg:col-span-2",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "₹0",
    period: "forever",
    desc: "Perfect for small businesses getting started.",
    features: ["Up to 1,000 SKUs", "2 Warehouses", "Basic Reporting", "Community Support"],
    popular: false,
  },
  {
    name: "Pro",
    price: "₹2,999",
    period: "per user / mo",
    desc: "For growing teams needing advanced workflows.",
    features: ["Unlimited SKUs", "Unlimited Warehouses", "Advanced Analytics", "Priority Support", "Role-based Access"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For large scale operations requiring custom setup.",
    features: ["Custom Integrations", "Dedicated Success Manager", "SLA Guarantees", "On-premise Deployment options"],
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Head of Operations, Reliance Industries",
    content: "StockFlow replaced 3 different legacy systems for us. The speed and design are unmatched.",
  },
  {
    name: "Arjun Mehta",
    role: "Founder, Peak Supply Co.",
    content: "Finally, an inventory tool that doesn't look like it was built in 1995. It's a joy to use daily.",
  },
  {
    name: "Kavya Nair",
    role: "Supply Chain Manager, Tata Enterprises",
    content: "The multi-warehouse synchronization is flawless. It saved us hundreds of hours of manual entry.",
  },
];

const FAQS = [
  {
    q: "How fast can we migrate to StockFlow?",
    a: "Most teams are fully onboarded within 48 hours. Our bulk CSV import tools make moving data from legacy systems frictionless.",
  },
  {
    q: "Does it support multi-currency?",
    a: "Yes, StockFlow handles multi-currency transactions and automatically calculates exchange rates for accurate financial reporting.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade encryption at rest and in transit, with daily automated backups and granular role-based access control.",
  },
  {
    q: "Can I manage multiple businesses?",
    a: "Yes, StockFlow supports multi-organization setups. You can switch between different company workspaces with a single click.",
  },
];

// --- COMPONENTS ---
function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between text-left focus:outline-none">
        <span className="text-lg font-medium text-gray-900">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="pt-4 text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans selection:bg-gray-900 selection:text-white">
      {/* ─── HEADER ─── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs tracking-tighter">SF</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">StockFlow</span>
        </div>
        <div className="flex items-center gap-6">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
          >
            Start Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-40 pb-20 px-6 lg:px-12 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-gray-100 to-transparent -z-10 blur-3xl opacity-50" />
        
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 mb-8 border border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-900"></span>
          </span>
          StockFlow 2.0 is now live
        </motion.div>

        <motion.h1 custom={0.1} variants={fadeUp} initial="hidden" animate="show" className="text-5xl lg:text-7xl font-bold tracking-tighter text-gray-900 leading-[1.05] mb-8">
          Inventory management,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-300">designed for speed.</span>
        </motion.h1>

        <motion.p custom={0.2} variants={fadeUp} initial="hidden" animate="show" className="text-lg lg:text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
          StockFlow replaces complex ERPs with a lightning-fast, beautiful interface. Manage warehouses, track orders, and monitor financials—all in one place.
        </motion.p>

        <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate="show" className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-all text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Start your free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-medium rounded-md border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm shadow-sm"
          >
            Sign in
          </Link>
        </motion.div>

        {/* Abstract Dashboard Mockup */}
        <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate="show" className="w-full max-w-5xl mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
          <div className="rounded-xl border border-gray-200/60 bg-white/50 backdrop-blur-sm shadow-2xl p-4 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="grid grid-cols-4 gap-4 h-[300px] lg:h-[400px]">
              <div className="col-span-1 hidden lg:flex flex-col gap-2 border-r border-gray-100 pr-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded-md w-full" />)}
              </div>
              <div className="col-span-4 lg:col-span-3 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="h-24 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-24 bg-gray-100 rounded-lg flex-1" />
                  <div className="h-24 bg-gray-100 rounded-lg flex-1 hidden sm:block" />
                </div>
                <div className="h-full bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                  <Activity className="w-12 h-12 text-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 opacity-60 grayscale">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center">Trusted by modern teams</p>
          <div className="flex gap-8 md:gap-16">
            <div className="text-xl font-bold font-mono">ACME CORP</div>
            <div className="text-xl font-bold font-mono hidden sm:block">GLOBALNET</div>
            <div className="text-xl font-bold font-mono">SUPPLYCO</div>
          </div>
        </div>
      </section>

      {/* ─── BENTO BOX FEATURES ─── */}
      <section className="py-32 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 mb-4">
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-gray-500 text-lg">
            A comprehensive suite of tools perfectly balanced between power and simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[240px]">
          {BENTO_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`group bg-gray-50 border border-gray-200/60 hover:border-gray-300 rounded-2xl p-8 flex flex-col transition-all duration-300 ${feature.colSpan}`}
            >
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-auto group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5 text-gray-900" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm max-w-md">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── DEEP DIVE SECTION ─── */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-32">
          
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                <Globe className="w-6 h-6 text-gray-300" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter">Multi-Warehouse Intelligence</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Seamlessly transfer stock between locations, monitor transit statuses, and get real-time valuation of inventory segmented by warehouse.
              </p>
              <ul className="space-y-3 pt-4">
                {['Stock transfers', 'Location-based analytics', 'Unified catalog'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-gray-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-[4/3] rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl overflow-hidden relative p-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/50 to-transparent" />
                <div className="h-full w-full border border-gray-600 rounded-xl bg-gray-900/80 p-6 flex flex-col gap-4">
                  <div className="h-10 w-1/3 bg-gray-700 rounded-md" />
                  <div className="flex-1 flex gap-4">
                    <div className="flex-1 bg-gray-800 rounded-md border border-gray-700" />
                    <div className="flex-1 bg-gray-800 rounded-md border border-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 mb-4">Loved by operators.</h2>
            <p className="text-gray-500 text-lg">Don't just take our word for it.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-gray-200 bg-gray-50"
              >
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-gray-900 text-gray-900" />)}
                </div>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed font-medium">"{t.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-32 px-6 lg:px-12 bg-gray-50 border-y border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 mb-4">Simple, transparent pricing.</h2>
            <p className="text-gray-500 text-lg">Start for free, upgrade when you need to.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative flex flex-col p-8 rounded-3xl ${plan.popular ? 'bg-gray-900 text-white shadow-xl scale-105 z-10' : 'bg-white border border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-gray-900 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border border-gray-200">
                    Most Popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.desc}</p>
                </div>
                <div className="mb-8">
                  <span className={`text-4xl font-bold tracking-tight ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                  <span className={`text-sm ml-2 ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-gray-400' : 'text-gray-900'}`} />
                      <span className={`text-sm ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`w-full py-3 px-6 rounded-lg text-sm font-medium text-center transition-colors ${
                    plan.popular 
                      ? 'bg-white text-gray-900 hover:bg-gray-100' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQS ─── */}
      <section className="py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 mb-4">Frequently asked questions</h2>
          </div>
          <div className="border-t border-gray-200">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-32 px-6 lg:px-12 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6">Ready to upgrade your supply chain?</h2>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed max-w-xl mx-auto">
              Join thousands of businesses managing their inventory, orders, and finances with StockFlow.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start your free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-gray-200 pt-20 pb-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-tighter">SF</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">StockFlow</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">
              The modern operating system for inventory and supply chain management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/signup" className="hover:text-gray-900">Features</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Pricing</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Integrations</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/signup" className="hover:text-gray-900">About Us</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Careers</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Blog</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/signup" className="hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to="/signup" className="hover:text-gray-900">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} StockFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
             {/* Mock social icons */}
             <div className="w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors cursor-pointer" />
             <div className="w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors cursor-pointer" />
             <div className="w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors cursor-pointer" />
          </div>
        </div>
      </footer>
    </div>
  );
}

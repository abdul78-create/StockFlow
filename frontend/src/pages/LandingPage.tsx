import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  BarChart3,
  Truck,
  ShoppingCart,
  Users,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Factory,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const } }),
};

const FEATURES = [
  {
    icon: Package,
    title: "Inventory Management",
    desc: "Real-time stock tracking across unlimited warehouses. Automated low-stock alerts and expiry monitoring.",
  },
  {
    icon: ShoppingCart,
    title: "Purchase & Sales Orders",
    desc: "End-to-end order lifecycle — from draft to delivery. Full audit trail and approval workflows.",
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    desc: "Revenue, expense, and profit reporting in real-time. See exactly where your money is coming from.",
  },
  {
    icon: Truck,
    title: "Supplier Management",
    desc: "Centralize all supplier contacts, pricing, and purchase history. Never lose track of a delivery.",
  },
  {
    icon: Users,
    title: "Customer Relationships",
    desc: "Track customers, their orders, and payment history. Build stronger business relationships.",
  },
  {
    icon: Factory,
    title: "Multi-Warehouse",
    desc: "Manage stock across multiple physical locations. Transfer inventory between warehouses seamlessly.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Fine-grained permissions for every team member. Admins, managers, and staff — all controlled.",
  },
  {
    icon: Zap,
    title: "Automation Engine",
    desc: "Automate stock replenishment, order triggers, and notifications. Let the system work for you.",
  },
  {
    icon: Globe,
    title: "Multi-Organization",
    desc: "Run multiple businesses from one account. Switch between workspaces with a single click.",
  },
];

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden font-sans selection:bg-gray-900 selection:text-white">
      {/* ─── HEADER ─────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tighter">SF</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">StockFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
          >
            Start Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="relative pt-40 pb-32 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 mb-8 border border-gray-200 bg-white shadow-sm"
        >
          <span className="w-1.5 h-1.5 bg-gray-900 rounded-full" />
          Enterprise Inventory Management
        </motion.div>

        <motion.h1
          custom={0.1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-5xl lg:text-7xl font-bold tracking-tighter text-gray-900 leading-[1.05] mb-6"
        >
          The operating system
          <br />
          <span className="text-gray-400">for your supply chain.</span>
        </motion.h1>

        <motion.p
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto"
        >
          StockFlow connects your products, warehouses, suppliers, and customers into one intelligent platform. No clutter, no legacy software — just what works.
        </motion.p>

        <motion.div
          custom={0.3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-all text-sm shadow-md hover:shadow-lg"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-gray-700 font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors text-sm shadow-sm"
          >
            Sign in
          </Link>
        </motion.div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tighter text-gray-900 mb-4">
              Everything you need, built right.
            </h2>
            <p className="text-gray-500 text-lg">
              We built StockFlow to replace bloated, legacy ERPs with a clean, fast, and reliable workflow.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-5 group-hover:border-gray-200 group-hover:bg-gray-100 transition-colors">
                  <feature.icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="py-32 px-6 lg:px-12 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6">
              Ready to take control?
            </h2>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed max-w-xl mx-auto">
              Join the platform that puts design, speed, and reliability at the forefront of inventory management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-md hover:bg-gray-100 transition-colors shadow-lg"
              >
                Create your workspace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[9px] tracking-tighter">SF</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">StockFlow</span>
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} StockFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

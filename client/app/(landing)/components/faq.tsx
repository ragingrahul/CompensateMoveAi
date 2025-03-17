"use client";

import Button from "@/components/Button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does crypto payroll work?",
    answer:
      "Compensate is a cutting-edge payroll software leveraging the power of blockchain and cryptocurrency to revolutionize how businesses manage employee compensation. Designed for transparency, security, and efficiency, Compensate enables seamless, real-time payroll processing",
  },
  {
    question: "What cryptocurrencies do you support?",
    answer:
      "We support major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and USDC. We're constantly adding support for more cryptocurrencies based on user demand and market stability.",
  },
  {
    question: "Is crypto payroll legal in my country?",
    answer:
      "Cryptocurrency regulations vary by country. Our platform includes built-in compliance checks and will guide you through the requirements specific to your jurisdiction. We recommend consulting with your legal team for specific advice.",
  },
  {
    question: "How do you handle tax compliance?",
    answer:
      "Our platform automatically calculates and handles tax requirements across different jurisdictions. We generate all necessary documentation for both employers and employees, making tax season hassle-free.",
  },
  {
    question: "What security measures do you have in place?",
    answer:
      "We implement enterprise-grade security protocols including multi-signature wallets, cold storage, regular security audits, and multi-factor authentication. All transactions are encrypted and monitored 24/7.",
  },
  {
    question: "Can I integrate with my existing HR software?",
    answer:
      "Yes, we offer seamless integration with popular HR and payroll software through our API. Our platform supports both direct integration and CSV imports/exports for maximum flexibility.",
  },
];

export function FaqSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Abstract background elements */}
        <div className="absolute top-40 right-0 w-96 h-96 bg-purple-100/50 rounded-full filter blur-[120px] opacity-70" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-100/60 rounded-full filter blur-[100px] opacity-60" />
        <div className="absolute top-60 left-20 w-60 h-60 bg-blue-100/40 rounded-full filter blur-[80px] opacity-40" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 bg-grid-pattern opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 0V20M0 1H20' stroke='%23AF7EFF' stroke-width='0.5'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Changed to flex and min-h-full to ensure proper height inheritance */}
      <div className="container mx-auto px-4 flex-1 h-full relative z-10">
        {/* Added min-h-full here as well */}
        <div className="grid md:grid-cols-2 gap-16 h-full">
          <motion.div
            className="flex flex-col justify-between h-full"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div>
              {/* Section badge */}
              <div className="inline-flex mb-6">
                <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium inline-flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                  Frequently Asked Questions
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                Everything You Need to Know
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about crypto payroll management
              </p>
            </div>
            <div className="mt-auto bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 space-y-4">
              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                Have more questions?
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Our team is ready to help with any questions about crypto
                payroll
              </p>
              <Button
                name="Contact Support"
                variant="primary"
                size="lg"
                className="shadow-lg shadow-purple-200/50 hover:shadow-purple-300/50 transition-all duration-300 hover:scale-105"
              />
            </div>
          </motion.div>

          <motion.div
            className="h-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-4"
                  >
                    <AccordionTrigger className="text-left text-xl font-semibold hover:text-indigo-600 px-6 py-4 hover:no-underline data-[state=open]:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-lg text-gray-600 px-6 pb-6">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

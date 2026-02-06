"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <DesktopNavbar />

            <main className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-primary">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8 text-sm italic">Last Updated: February 6, 2026</p>

                    <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">1. Information We Collect</h2>
                            <p>
                                We collect information that you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include your name, email address, shipping address, and payment information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Process and fulfill your orders.</li>
                                <li>Communicate with you about your orders and our services.</li>
                                <li>Personalize your experience on our website.</li>
                                <li>Improve our products and services.</li>
                                <li>Send you marketing communications, if you have opted in.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">3. Information Sharing</h2>
                            <p>
                                We do not sell your personal information to third parties. We may share your information with service providers who perform functions on our behalf, such as payment processors and shipping carriers. We may also disclose information to comply with legal obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">4. Cookies and Tracking Technologies</h2>
                            <p>
                                We use cookies and similar tracking technologies to collect information about your browsing behavior on our website. This helps us analyze website traffic and improve our services. You can manage your cookie preferences in your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">5. Data Security</h2>
                            <p>
                                We implement reasonable security measures to protect your personal information from unauthorized access and disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">6. Your Rights</h2>
                            <p>
                                You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications from us at any time by following the instructions in those communications.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">7. Children's Privacy</h2>
                            <p>
                                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">8. Changes to This Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on our website. Your continued use of our services after the changes take effect constitutes your acceptance of the new policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">9. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at privacy@rupalicollection.com.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}

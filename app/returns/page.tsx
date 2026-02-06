"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* <Navbar />
            <DesktopNavbar /> */}

            <main className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-primary">Returns & Exchanges</h1>
                    <p className="text-muted-foreground mb-8 text-sm italic">Last Updated: February 6, 2026</p>

                    <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">1. Return Policy</h2>
                            <p>
                                We want you to be completely satisfied with your purchase. If you are not happy with your order, you can return or exchange the item within 7 days of delivery.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">2. Eligibility for Returns</h2>
                            <p>
                                To be eligible for a return, your item must be:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Unused, unworn, and in the same condition that you received it.</li>
                                <li>In the original packaging with all tags and labels attached.</li>
                                <li>Accompanied by the original invoice or proof of purchase.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">3. Non-Returnable Items</h2>
                            <p>
                                Certain types of items cannot be returned, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Custom-made or personalized items.</li>
                                <li>Items purchased during a Clearance or Final Sale.</li>
                                <li>Lingerie or intimate apparel for hygiene reasons.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">4. Return Process</h2>
                            <p>
                                To initiate a return, please log in to your account and go to the "My Orders" section. Select the order and item you wish to return and follow the instructions. Once your request is approved, our courier partner will pick up the item within 2-3 business days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">5. Exchanges</h2>
                            <p>
                                If you need to exchange an item for a different size or color, please follow the return process and place a new order for the desired item. Alternatively, you can contact our support team for assistance with direct exchanges.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">6. Refunds</h2>
                            <p>
                                Once we receive and inspect your return, we will notify you of the status of your refund. If approved, the refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">7. Contact Us</h2>
                            <p>
                                If you have any questions about our Returns & Exchanges policy, please reach out to us at care@rupalicollection.com.
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

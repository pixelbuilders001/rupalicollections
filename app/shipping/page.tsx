"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

export default function ShippingPage() {
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
                    <h1 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-primary">Shipping Policy</h1>
                    <p className="text-muted-foreground mb-8 text-sm italic">Last Updated: February 6, 2026</p>

                    <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">1. Shipping Coverage</h2>
                            <p>
                                Rupali Collections currently ships to all major cities and towns across India. We also offer international shipping to selected countries. Please contact our support team if you are unsure about delivery to your specific location.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">2. Processing Time</h2>
                            <p>
                                All orders are processed within 2-4 business days. Orders are not shipped or delivered on weekends or public holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">3. Shipping Rates & Delivery Estimates</h2>
                            <p>
                                Shipping charges for your order will be calculated and displayed at checkout.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Prepaid Orders:</strong> Free shipping across India.</li>
                                <li><strong>COD Orders:</strong> A small convenience fee of ₹99 applies.</li>
                                <li><strong>Estimated Delivery:</strong> 5-7 business days depending on the location.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">4. Shipment Confirmation & Order Tracking</h2>
                            <p>
                                You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">5. Damages</h2>
                            <p>
                                Rupali Collections is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">6. International Shipping</h2>
                            <p>
                                We ship internationally! International shipping rates and delivery times vary by destination. Any customs duties, taxes, or additional fees charged by the destination country are the responsibility of the customer.
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

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const getUsername = (): string | null => {
    const match = document.cookie.match(/(^| )username=([^;]+)/);
    return match ? match[2] : null;
};

const HomePage = () => {
    const [username, setUsername] = useState("Guest");

    useEffect(() => {
        const name = getUsername();
        if (name) setUsername(name);
    }, []);

    return (
        <div className="relative flex flex-col justify-center items-center min-h-[70vh] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center space-y-6 px-4"
            >
                <motion.h1
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 12,
                        duration: 1,
                    }}
                    className="text-5xl font-extrabold tracking-tight relative inline-block"
                >
                    Hello, {username}!
                </motion.h1>

                {/* Higher underline */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                        duration: 3.5,
                        ease: "easeInOut",
                    }}
                    className="h-1 bg-gray-800 rounded-md mx-auto"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="text-gray-600 text-xl mx-auto"
                >
                    🚀 Manage events, update them, create new ones, and delete with ease!
                </motion.p>
            </motion.div>
        </div>
    );
};

export default HomePage;
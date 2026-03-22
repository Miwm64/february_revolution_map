import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";

const CreateAdminPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("http://frmap.miwm64.spb.ru/api/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) throw new Error("Failed to create admin");

            setMessage("Admin created successfully!");
            setUsername("");
            setPassword("");
        } catch (err) {
            console.error(err);
            setMessage("Error creating admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Admin</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 font-medium">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="border p-2 w-full rounded"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border p-2 w-full rounded"
                                required
                            />
                        </div>

                        {message && (
                            <div className="text-sm text-center">{message}</div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Admin"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateAdminPage;
import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (user: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [nif, setNif] = useState('');
    const [password, setPassword] = useState('');
    const [entidade, setEntidade] = useState('SESI');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nif, password, entidade }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha no login');
            }

            // Success
            onLogin(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen font-sans">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-[#001D4A] flex-col items-center justify-center p-12 text-white">
                <div className="mb-8">
                     {/* Placeholder for construction icon - using SVG directly for portability */}
                    <svg className="w-32 h-32 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h1 className="text-6xl font-bold tracking-widest mb-4">SIGO</h1>
                <p className="text-xl tracking-wider text-center max-w-md">
                    SISTEMA DE INVESTIMENTOS E GESTÃO DE OBRAS
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 bg-[#E6E8EF] flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                         {/* SESI SENAI Logo Placeholder */}
                        <div className="flex justify-center items-center space-x-0 mb-6">
                            <div className="bg-[#E32119] text-white px-4 py-1 text-2xl font-bold italic tracking-tighter">SESI</div>
                            <div className="w-[2px] h-8 bg-white mx-1"></div>
                            <div className="bg-[#E32119] text-white px-4 py-1 text-2xl font-bold italic tracking-tighter">SENAI</div>
                        </div>
                        <h2 className="text-2xl font-bold text-[#001D4A]">Login</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="nif" className="sr-only">NIF / Usuário</label>
                            <input
                                id="nif"
                                type="text"
                                required
                                className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#00AEEF] focus:border-[#00AEEF] sm:text-sm shadow-sm"
                                placeholder="TC9153"
                                value={nif}
                                onChange={(e) => setNif(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#00AEEF] focus:border-[#00AEEF] sm:text-sm shadow-sm"
                                placeholder="•••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="entidade" className="sr-only">Entidade</label>
                            <select
                                id="entidade"
                                className="appearance-none rounded-md relative block w-full px-4 py-3 border border-gray-300 text-gray-700 bg-white focus:outline-none focus:ring-[#00AEEF] focus:border-[#00AEEF] sm:text-sm shadow-sm"
                                value={entidade}
                                onChange={(e) => setEntidade(e.target.value)}
                            >
                                <option value="SESI">SESI</option>
                                <option value="SENAI">SENAI</option>
                            </select>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-sky-300' : 'bg-[#00AEEF] hover:bg-sky-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors shadow-md`}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;

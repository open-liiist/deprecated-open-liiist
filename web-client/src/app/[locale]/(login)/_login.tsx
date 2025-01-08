'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
    const t = useTranslations('');
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const [selectedSupermarkets, setSelectedSupermarkets] = useState<string[]>([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const router = useRouter();

    const handleToggle = (supermarket: string) => {
        if (selectedSupermarkets.includes(supermarket)) {
            setSelectedSupermarkets((prev) =>
                prev.filter((item) => item !== supermarket)
            );
        } else {
            setSelectedSupermarkets((prev) => [...prev, supermarket]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setPending(true);
        setError(null);

        const payload = mode === 'signin' ? { email, password } : { email, password, name, dateOfBirth, supermarkets: selectedSupermarkets };
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
        console.log(`Fetching API URL: ${apiUrl}`);

        try {
            const response = await fetch(`${apiUrl}/auth/${mode === 'signin' ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include', // Include cookies
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to authenticate');
            }

            const data = await response.json();

            if (mode === 'signin') {
                const { accessToken, refreshToken, user } = data.data;

                // Salva i token in localStorage
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Redirect dopo il login
                if (redirect) {
                    router.push(redirect);
                } else {
                    router.push('/home');
                }
            } else {
                // Registrazione riuscita, reindirizza al login
                router.push('/sign-in');
            }

        } catch (err) {
            console.error('Error during authentication:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-liiist_white">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className={`text-5xl font-bold mb-6 text-liiist_green text-center`}>liiist</h1>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-liiist_green">
                    {mode === 'signin' ? t('auth.signIn') : t('auth.create')}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="redirect" value={redirect || ''} />

                    {mode === 'signup' && (
                        <>
                            <div>
                                <div className="mt-1">
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        maxLength={50}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                        placeholder="Insert your name"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mt-1">
                                    <Input
                                        id="dob"
                                        name="dateOfBirth"
                                        type="date"
                                        required
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                        className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                        placeholder="birthday"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <div className="mt-1">
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                maxLength={50}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                placeholder="email"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mt-1">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                                required
                                minLength={8}
                                maxLength={100}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                placeholder="password"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    {mode === 'signup' && (
                        <div>
                            <Label htmlFor="supermarkets" className="block text-sm font-medium text-liiist_green px-2 mb-4 mt-10">
                                Select the chains you are a member of 
                            </Label>
                            <div className="mt-1 grid grid-cols-2 gap-4 px-2">
                                {['tigre', 'peweex', 'Conad', 'ma gros'].map((supermarket) => (
                                    <label
                                        key={supermarket}
                                        className="flex items-center cursor-pointer space-x-3"
                                    >
                                        <input
                                            type="checkbox"
                                            name="supermarkets"
                                            value={supermarket}
                                            checked={selectedSupermarkets.includes(supermarket)}
                                            onChange={() => handleToggle(supermarket)}
                                            className="h-5 w-5 text-liiist_green focus:ring-liiist_green border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{supermarket}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div>
                        <Button
                            type="submit"
                            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-liiist_green hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
                            disabled={pending}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Loading...
                                </>
                            ) : mode === 'signin' ? (
                                'Sign In'
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-7 bg-liiist_white text-gray-500">
                                {mode === 'signin' ? 'New on liiist?' : 'Do you have an account yet?'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href={
                                `${mode === 'signin' ? '/sign-up' : '/sign-in'}${redirect ? `?redirect=${redirect}` : ''}`
                            }
                            className="w-full flex justify-center py-2 px-4 border border-liiist_green rounded-lg shadow-sm text-sm font-medium text-liiist_green hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
                        >
                            {mode === 'signin' ? 'Create your account' : 'Access with your account'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


// 'use client';

// import Link from 'next/link';
// import { useState , useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Loader2 } from 'lucide-react';
// import { signIn, signUp } from './actions';
// import { ActionState } from '@/services/auth/middleware';
// import { useFormState } from 'react-dom';
// import { useTranslations } from 'next-intl';
// import { useRouter } from 'next/navigation';

// export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
//     const t = useTranslations('');
//     const searchParams = useSearchParams();
//     const redirect = searchParams.get('redirect');
//     const [selectedSupermarkets, setSelectedSupermarkets] = useState([]);

//     const [state, formAction, pending] = useFormState<ActionState, FormData>(
//         mode === 'signin' ? signIn : signUp,
//         { error: '' }
//     );
//     const router = useRouter();


//     const handleToggle = (supermarket) => {
//         if (selectedSupermarkets.includes(supermarket)) {
//             setSelectedSupermarkets((prev) =>
//                 prev.filter((item) => item !== supermarket)
//             );
//         } else {
//             setSelectedSupermarkets((prev) => [...prev, supermarket]);
//         }
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         const formData = new FormData(event.target);
//         formData.set('supermarkets', JSON.stringify(selectedSupermarkets));

//         const typedResult = await formAction(formData) as { success?: boolean };

//         if (typedResult?.success) {
//             // Non è necessario salvare i token qui se stai usando cookie HTTP-Only
//             // Se desideri comunque salvarli, potresti dover fare una richiesta separata lato client

//             // Redirect dopo il login
//             if (redirect) {
//                 router.push(redirect);
//             } else {
//                 router.push("/home");
//             }
//         }
//     };

//     useEffect(() => {
//         if (state && state.error) {
//             // Gestisci l'errore, ad esempio mostra un messaggio all'utente
//             console.error(state.error);
//         }
//     }, [state]);

//     return (
//         <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-liiist_white">
//             <div className="sm:mx-auto sm:w-full sm:max-w-md">
//                 <h1 className={`text-5xl font-bold mb-6 text-liiist_green text-center`}>liiist</h1>
//                 <h2 className="mt-6 text-center text-3xl font-extrabold text-liiist_green">
//                     {mode === 'signin' ? t('auth.signIn') : t('auth.create')}
//                 </h2>
//             </div>

//             <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
//                 <form className="space-y-6" onSubmit={handleSubmit}>
//                     <input type="hidden" name="redirect" value={redirect || ''} />

//                     {mode === 'signup' && (
//                         <>
//                             <div>
//                                 <div className="mt-1">
//                                     <Input
//                                         id="name"
//                                         name="name"
//                                         type="text"
//                                         required
//                                         maxLength={50}
//                                         className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                         placeholder="Insert your name"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <div className="mt-1">
//                                     <Input
//                                         id="dob"
//                                         name="dateOfBirth"
//                                         type="date"
//                                         required
//                                         className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                         placeholder="birthday"
//                                     />
//                                 </div>
//                             </div>

                            
//                         </>
//                     )}

//                     <div>
//                         <div className="mt-1">
//                             <Input
//                                 id="email"
//                                 name="email"
//                                 type="email"
//                                 autoComplete="email"
//                                 required
//                                 maxLength={50}
//                                 className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                 placeholder="email"
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <div className="mt-1">
//                             <Input
//                                 id="password"
//                                 name="password"
//                                 type="password"
//                                 autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
//                                 required
//                                 minLength={8}
//                                 maxLength={100}
//                                 className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                 placeholder="password"
//                             />
//                         </div>
//                     </div>

//                     {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}
//                     {mode === 'signup' && (<>
//                         <div>
//                                 <Label htmlFor="supermarkets" className="block text-sm font-medium text-liiist_green px-2 mb-4 mt-10">
//                                         select the chains you are a member of 
//                                 </Label>
//                                 <div className="mt-1 grid grid-cols-2 gap-4 px-2">
//                                     {['tigre', 'peweex', 'Conad', 'ma gros'].map((supermarket) => (
//                                         <label
//                                             key={supermarket}
//                                             className="flex items-center cursor-pointer space-x-3"
//                                         >
//                                             <input
//                                                 type="checkbox"
//                                                 name="supermarkets"
//                                                 value={supermarket}
//                                                 checked={selectedSupermarkets.includes(supermarket)}
//                                                 onChange={() => handleToggle(supermarket)}
//                                                 className="h-5 w-5 text-liiist_green focus:ring-liiist_green border-gray-300 rounded"
//                                             />
//                                             <span className="text-sm text-gray-700">{supermarket}</span>
//                                         </label>
//                                     ))}
//                                 </div>
//                             </div>
//                     </>
//                     )}
//                     <div>
//                         <Button
//                             type="submit"
//                             className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-liiist_green hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
//                             disabled={pending}
//                         >
//                             {pending ? (
//                                 <>
//                                     <Loader2 className="animate-spin mr-2 h-4 w-4" />
//                                     Loading...
//                                 </>
//                             ) : mode === 'signin' ? (
//                                 'sign in'
//                             ) : (
//                                 'sign up'
//                             )}
//                         </Button>
//                     </div>
//                 </form>

//                 <div className="mt-6">
//                     <div className="relative">
//                         <div className="absolute inset-0 flex items-center">
//                             <div className="w-full border-t border-gray-300" />
//                         </div>
//                         <div className="relative flex justify-center text-sm">
//                             <span className="px-7 bg-liiist_white text-gray-500">
//                                 {mode === 'signin' ? 'New on liiist?' : 'Do you have an account yet?'}
//                             </span>
//                         </div>
//                     </div>

//                     <div className="mt-6">
//                         <Link
//                             href={
//                                 `${mode === 'signin' ? '/sign-up' : '/sign-in'}
//                                 ${redirect ? `?redirect=${redirect}` : ''}`
//                             }
//                             className="w-full flex justify-center py-2 px-4 border border-liiist_green rounded-lg shadow-sm text-sm font-medium text-liiist_green hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
//                         >
//                             {mode === 'signin' ? 'Create your account' : 'acces with your account'}
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


//ver 2.0
// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Loader2 } from 'lucide-react';
// import { signIn, signUp } from './actions';
// import { ActionState } from '@/services/auth/middleware';
// import { useFormState } from 'react-dom';
// import { useTranslations } from 'next-intl';
// import { noto_Sans } from '@/components/ui/fonts';

// export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
//     const t = useTranslations('');
//     const searchParams = useSearchParams();
//     const redirect = searchParams.get('redirect');
//     const [selectedSupermarkets, setSelectedSupermarkets] = useState([]);

//     const [state, formAction, pending] = useFormState<ActionState, FormData>(
//         mode === 'signin' ? signIn : signUp,
//         { error: '' }
//     );

// 	const handleToggle = (supermarket) => {
// 		if (selectedSupermarkets.includes(supermarket)) {
// 			setSelectedSupermarkets((prev) =>
// 				prev.filter((item) => item !== supermarket)
// 			);
// 		} else {
// 			setSelectedSupermarkets((prev) => [...prev, supermarket]);
// 		}
// 	};

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         const formData = new FormData(e.target);
    
//         // Elimina qualsiasi valore esistente di "supermarkets" in `formData` 
//         formData.delete("supermarkets");
    
//         // Aggiungi i supermercati selezionati come array a `formData`
//         selectedSupermarkets.forEach((supermarket) => {
//             formData.append("supermarkets", supermarket);
//         });
    
//         console.log("Form data being submitted:", Object.fromEntries(formData));
//         formAction(formData);
//     };

//     return (
//         <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-liiist_white">
//             <div className="sm:mx-auto sm:w-full sm:max-w-md">
//                 <h1 className={`${noto_Sans.className} text-5xl font-bold mb-6 text-liiist_green text-center`}>liiist</h1>
//                 <h2 className="mt-6 text-center text-3xl font-extrabold text-liiist_green">
//                     {mode === 'signin' ? t('auth.signIn') : t('auth.create')}
//                 </h2>
//             </div>

//             <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
//                 <form className="space-y-6" action={formAction} onSubmit={handleSubmit}>
//                     <input type="hidden" name="redirect" value={redirect || ''} />

//                     {mode === 'signup' && (
//                         <>
//                             <div>
//                                 <Label htmlFor="name" className="block text-sm font-medium text-liiist_green px-6">
//                                     Nome
//                                 </Label>
//                                 <div className="mt-1">
//                                     <Input
//                                         id="name"
//                                         name="name"
//                                         type="text"
//                                         required
//                                         maxLength={50}
//                                         className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                         placeholder="Inserisci il tuo nome"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
//                                 <Label htmlFor="dob" className="block text-sm font-medium text-liiist_green px-6">
//                                     Data di Nascita
//                                 </Label>
//                                 <div className="mt-1">
//                                     <Input
//                                         id="dateOfBirth"
//                                         name="dateOfBirth"
//                                         type="date"
//                                         required
//                                         className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                     />
//                                 </div>
//                             </div>

//                             <div>
// 				            	<Label htmlFor="supermarkets" className="block text-sm font-medium text-liiist_green px-6">
// 				            		Supermercati di cui sei socio
// 				            	</Label>
// 				            	<div className="mt-1 grid grid-cols-2 gap-4">
// 				            		{['Coop', 'Carrefour', 'Conad', 'Esselunga', 'Pam'].map((supermarket) => (
// 				            			<label
// 				            				key={supermarket}
// 				            				className="flex items-center cursor-pointer space-x-3"
// 				            			>
// 				            				<input
// 				            					type="checkbox"
// 				            					name="supermarkets"
// 				            					value={supermarket}
// 				            					checked={selectedSupermarkets.includes(supermarket)}
// 				            					onChange={() => handleToggle(supermarket)}
// 				            					className="h-5 w-5 text-liiist_green focus:ring-liiist_green border-gray-300 rounded"
// 				            				/>
// 				            				<span className="text-sm text-gray-700">{supermarket}</span>
// 				            			</label>
// 				            		))}
// 				            	</div>
// 				            </div>
//                         </>
//                     )}

//                     <div>
//                         <Label htmlFor="email" className="block text-sm font-medium text-liiist_green px-6">
//                             Email
//                         </Label>
//                         <div className="mt-1">
//                             <Input
//                                 id="email"
//                                 name="email"
//                                 type="email"
//                                 autoComplete="email"
//                                 required
//                                 maxLength={50}
//                                 className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                 placeholder="Inserisci la tua email"
//                             />
//                         </div>
//                     </div>

//                     <div>
//                         <Label htmlFor="password" className="block text-sm font-medium text-liiist_green px-6 pb-0">
//                             Password
//                         </Label>
//                         <div className="mt-1">
//                             <Input
//                                 id="password"
//                                 name="password"
//                                 type="password"
//                                 autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
//                                 required
//                                 minLength={8}
//                                 maxLength={100}
//                                 className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
//                                 placeholder="Inserisci la tua password"
//                             />
//                         </div>
//                     </div>

//                     {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

//                     <div>
//                         <Button
//                             type="submit"
//                             className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-liiist_green hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
//                             disabled={pending}
//                         >
//                             {pending ? (
//                                 <>
//                                     <Loader2 className="animate-spin mr-2 h-4 w-4" />
//                                     Caricamento...
//                                 </>
//                             ) : mode === 'signin' ? (
//                                 'Accedi'
//                             ) : (
//                                 'Registrati'
//                             )}
//                         </Button>
//                     </div>
//                 </form>

//                 <div className="mt-6">
//                     <div className="relative">
//                         <div className="absolute inset-0 flex items-center">
//                             <div className="w-full border-t border-gray-300" />
//                         </div>
//                         <div className="relative flex justify-center text-sm">
//                             <span className="px-7 bg-liiist_white text-gray-500">
//                                 {mode === 'signin' ? 'Nuovo su liiist?' : 'Hai già un account?'}
//                             </span>
//                         </div>
//                     </div>

//                     <div className="mt-6">
//                         <Link
//                             href={`
//                                 ${mode === 'signin' ? '/sign-up' : '/sign-in'}
//                                 ${redirect ? `?redirect=${redirect}` : ''}`
//                             }
//                             className="w-full flex justify-center py-2 px-4 border border-liiist_green rounded-lg shadow-sm text-sm font-medium text-liiist_green hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
//                         >
//                             {mode === 'signin' ? 'Crea un account' : 'Accedi con il tuo account'}
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }



// 'use client';

// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { CircleIcon, Loader2 } from 'lucide-react';
// import { signIn, signUp } from './actions';
// import { ActionState } from '@/services/auth/middleware';
// import { useFormState } from 'react-dom';
// import { useTranslations } from 'next-intl';
// import { oswald, noto_Sans } from '@/components/ui/fonts';

// export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
// 	const t = useTranslations('');
// 	const searchParams = useSearchParams();
// 	const redirect = searchParams.get('redirect');
// 	const [state, formAction, pending] = useFormState<ActionState, FormData>(
// 		mode === 'signin' ? signIn : signUp,
// 		{ error: '' }
// 	);

// 	return (
// 		<div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-liiist_white">
// 			<div className="sm:mx-auto sm:w-full sm:max-w-md">
// 				<h1 className={`${noto_Sans.className} text-5xl font-bold mb-6 text-liiist_green text-center`}>liiist</h1>
// 				<h2 className="mt-6 text-center text-3xl font-extrabold text-liiist_green">
// 					{mode === 'signin'
// 						? t('auth.signIn')
// 						: t('auth.create')}
// 				</h2>
// 			</div>

// 			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
// 				<form className="space-y-6" action={formAction}>
// 					<input type="hidden" name="redirect" value={redirect || ''} />
// 					<div>
// 						<Label
// 							htmlFor="email"
// 							className="block text-sm font-medium text-liiist_green px-6"
// 						>
// 							Email
// 						</Label>
// 						<div className="mt-1">
// 							<Input
// 								id="email"
// 								name="email"
// 								type="email"
// 								autoComplete="email"
// 								required
// 								maxLength={50}
// 								className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
// 								placeholder="Enter your email"
// 							/>
// 						</div>
// 					</div>

// 					<div>

// 						<Label
// 							htmlFor="password"
// 							className="block text-sm font-medium text-liiist_green px-6 pb-0"
// 						>
// 							Password
// 						</Label>
// 						<div className="mt-1">
// 							<Input
// 								id="password"
// 								name="password"
// 								type="password"
// 								autoComplete={
// 									mode === 'signin' ? 'current-password' : 'new-password'
// 								}
// 								required
// 								minLength={8}
// 								maxLength={100}
// 								className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
// 								placeholder="Enter your password"
// 							/>
// 						</div>
// 					</div>

// 					{state?.error && (
// 						<div className="text-red-500 text-sm">{state.error}</div>
// 					)}

// 					<div>
// 						<Button
// 							type="submit"
// 							className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-liiist_green hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
// 							disabled={pending}
// 						>
// 							{pending ? (
// 								<>
// 									<Loader2 className="animate-spin mr-2 h-4 w-4" />
// 									Loading...
// 								</>
// 							) : mode === 'signin' ? (
// 								'Sign in'
// 							) : (
// 								'Sign up'
// 							)}
// 						</Button>
// 					</div>
// 				</form>

// 				<div className="mt-6">
// 					<div className="relative">
// 						<div className="absolute inset-0 flex items-center">
// 							<div className="w-full border-t border-gray-300" />
// 						</div>
// 						<div className="relative flex justify-center text-sm">
// 							<span className="px-7 bg-liiist_white text-gray-500">
// 								{mode === 'signin'
// 									? 'New to our platform?'
// 									: 'Already have an account?'}
// 							</span>
// 						</div>
// 					</div>

// 					<div className="mt-6">
// 						<Link
// 							href={`
// 								${mode === 'signin' ? '/sign-up' : '/sign-in'}
// 								${redirect ? `?redirect=${redirect}` : ''}`
// 							}
// 							className="w-full flex justify-center py-2 px-4 border border-liiist_green rounded-lg shadow-sm text-sm font-medium text-liiist_green hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
// 						>
// 							{mode === 'signin'
// 								? 'Create an account'
// 								: 'Sign in to existing account'}
// 						</Link>
// 					</div>

// 				</div>
// 			</div>
// 		</div>
// 	);
// }

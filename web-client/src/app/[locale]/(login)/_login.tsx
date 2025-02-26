'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/services/auth/middleware';
import { useFormState } from 'react-dom';
import { useTranslations } from 'next-intl';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
    const t = useTranslations('');
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect');
    const [selectedSupermarkets, setSelectedSupermarkets] = useState([]);

    const [state, formAction, pending] = useFormState<ActionState, FormData>(
        mode === 'signin' ? signIn : signUp,
        { error: '' }
    );

    // Toggle selection for a supermarket
    const handleToggle = (supermarket) => {
        if (selectedSupermarkets.includes(supermarket)) {
            setSelectedSupermarkets((prev) =>
                prev.filter((item) => item !== supermarket)
            );
        } else {
            setSelectedSupermarkets((prev) => [...prev, supermarket]);
        }
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        formData.set('supermarkets', JSON.stringify(selectedSupermarkets));
        formAction(formData);
    };

    return (
        <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-liiist_white">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-6 text-start text-3xl font-extrabold text-liiist_green">
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
                                        className="appearance-none rounded-lg relative block w-full px-3 py-6 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                        placeholder="Enter your full name"
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
                                        className="appearance-none rounded-lg relative block w-full px-3 py-6 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                        placeholder="Enter your date of birth"
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
                                className="appearance-none rounded-lg relative block w-full px-3 py-6 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                placeholder="Enter your email address"
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
                                className="appearance-none rounded-lg relative block w-full px-3 py-6 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}
                    {mode === 'signup' && (
                        <>
                            <div>
                                <Label
                                    htmlFor="supermarkets"
                                    className="block text-sm font-medium text-liiist_green px-2 mb-4"
                                >
                                    Please select the supermarket chains you belong to
                                </Label>
                                <div className="mt-1 grid grid-cols-2 gap-4 px-2">
                                    {['Oasi Tigre', 'Gros', 'Conad', 'Carrefour', 'Decò'].map((supermarket) => (
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
                        </>
                    )}
                    <div>
                        <Button
                            type="submit"
                            className="flex justify-start items-center py-8 px-6 border border-transparent rounded-full shadow-sm text-base font-medium text-white bg-liiist_green hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
                            disabled={pending}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    Loading...
                                </>
                            ) : mode === 'signin' ? (
                                'Log In to Your Account'
                            ) : (
                                'Create Your Account'
                            )}
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-start text-sm">
                            <span className="px-1 bg-liiist_white text-gray-500">
                                {mode === 'signin' ? 'New here?' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6"></div>
                        <Link
                            href={
                                `${mode === 'signin' ? '/sign-up' : '/sign-in'}
                                ${redirect ? `?redirect=${redirect}` : ''}`
                            }
                            className="w-full flex justify-start py-2 px-2 text-base font-medium text-liiist_green"
                        >
                            {mode === 'signin'
                                ? 'Create a New Account'
                                : 'Log In to an Existing Account'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

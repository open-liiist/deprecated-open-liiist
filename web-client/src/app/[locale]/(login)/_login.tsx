'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CircleIcon, Loader2 } from 'lucide-react';
import { signIn, signUp } from './actions';
import { ActionState } from '@/services/auth/middleware';
import { useFormState } from 'react-dom';
import { useTranslations } from 'next-intl';
import { oswald, noto_Sans } from '@/components/ui/fonts';

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
	const t = useTranslations('');
	const searchParams = useSearchParams();
	const redirect = searchParams.get('redirect');
	const [state, formAction, pending] = useFormState<ActionState, FormData>(
		mode === 'signin' ? signIn : signUp,
		{ error: '' }
	);

	return (
		<div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-liiist_white">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h1 className={`${noto_Sans.className} text-5xl font-bold mb-6 text-liiist_green text-center`}>liiist</h1>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-liiist_green">
					{mode === 'signin'
						? t('auth.signIn')
						: t('auth.create')}
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
				<form className="space-y-6" action={formAction}>
					<input type="hidden" name="redirect" value={redirect || ''} />
					<div>
						<Label
							htmlFor="email"
							className="block text-sm font-medium text-liiist_green px-6"
						>
							Email
						</Label>
						<div className="mt-1">
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								maxLength={50}
								className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
								placeholder="Enter your email"
							/>
						</div>
					</div>

					<div>

						<Label
							htmlFor="password"
							className="block text-sm font-medium text-liiist_green px-6 pb-0"
						>
							Password
						</Label>
						<div className="mt-1">
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete={
									mode === 'signin' ? 'current-password' : 'new-password'
								}
								required
								minLength={8}
								maxLength={100}
								className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-liiist_green focus:border-liiist_green focus:z-10 sm:text-sm"
								placeholder="Enter your password"
							/>
						</div>
					</div>

					{state?.error && (
						<div className="text-red-500 text-sm">{state.error}</div>
					)}

					<div>
						<Button
							type="submit"
							className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-liiist_green hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
							disabled={pending}
						>
							{pending ? (
								<>
									<Loader2 className="animate-spin mr-2 h-4 w-4" />
									Loading...
								</>
							) : mode === 'signin' ? (
								'Sign in'
							) : (
								'Sign up'
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
								{mode === 'signin'
									? 'New to our platform?'
									: 'Already have an account?'}
							</span>
						</div>
					</div>

					<div className="mt-6">
						<Link
							href={`
								${mode === 'signin' ? '/sign-up' : '/sign-in'}
								${redirect ? `?redirect=${redirect}` : ''}`
							}
							className="w-full flex justify-center py-2 px-4 border border-liiist_green rounded-lg shadow-sm text-sm font-medium text-liiist_green hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-liiist_green"
						>
							{mode === 'signin'
								? 'Create an account'
								: 'Sign in to existing account'}
						</Link>
					</div>

				</div>
			</div>
		</div>
	);
}

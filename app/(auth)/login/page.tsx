'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
	const router = useRouter()
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setLoading(true)
		setError('')

		const formData = new FormData(e.currentTarget)

		const result = await signIn('credentials', {
			email: formData.get('email'),
			password: formData.get('password'),
			redirect: false,
		})

		if (result?.error) {
			setError('Invalid email or password')
			setLoading(false)
			return
		}

		router.push('/dashboard')
		router.refresh()
	}

	return (
		<Card className='w-full max-w-sm'>
			<CardHeader className='text-center'>
				<div className='flex justify-center mb-2'>
					<GraduationCap className='h-8 w-8 text-primary' />
				</div>
				<CardTitle className='text-xl'>Welcome back</CardTitle>
				<CardDescription>Sign in to your TeachFlow account</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit}
					className='space-y-4'
				>
					<div className='space-y-2'>
						<Label htmlFor='email'>Email</Label>
						<Input
							id='email'
							name='email'
							type='email'
							placeholder='you@school.com'
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password'>Password</Label>
						<Input
							id='password'
							name='password'
							type='password'
							placeholder='••••••••'
							required
						/>
					</div>

					{error && <p className='text-sm text-destructive'>{error}</p>}

					<Button
						type='submit'
						className='w-full'
						disabled={loading}
					>
						{loading ? 'Signing in...' : 'Sign in'}
					</Button>
				</form>

				<p className='text-center text-sm text-muted-foreground mt-4'>
					Don&apos;t have an account?{' '}
					<Link
						href='/register'
						className='text-primary hover:underline'
					>
						Register
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}

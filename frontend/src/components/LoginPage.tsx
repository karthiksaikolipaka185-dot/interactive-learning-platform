import { useState } from 'react';
import './LoginPage.css';
import { User } from '../data/users';

interface Props {
    onLogin: (user: User) => void;
}

export const LoginPage = ({ onLogin }: Props) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && password) {
            onLogin({ email, name: name || 'Student' });
        }
    };

    return (
        <div className="login-container">
            <div className="glass-card">
                <div className="card-header">
                    <h2 className="title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="subtitle">
                        {isLogin ? 'Enter your details to access your learning journey.' : 'Sign up to kickstart your success.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="form-content">
                    {!isLogin && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn text-white bg-blue-600 hover:bg-blue-700">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="card-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            className="toggle-link text-blue-500"
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

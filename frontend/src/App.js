import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Login from './components/Login';
import UserRegistration from './components/UserRegistration';
import UserManagement from './components/UserManagement';
import UserProfile from './components/profile/UserProfile';
import LeadList from './components/leads/LeadList';
import LeadDetail from './components/leads/LeadDetail';
import LeadForm from './components/leads/LeadForm';
import LeadEmail from './components/leads/LeadEmail';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Navigate to="/leads" replace />} />
                        
                        <Route
                            path="leads"
                            element={
                                <ProtectedRoute>
                                    <LeadList />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="leads/new"
                            element={
                                <ProtectedRoute>
                                    <LeadForm />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="leads/:id"
                            element={
                                <ProtectedRoute>
                                    <LeadDetail />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="leads/:id/email"
                            element={
                                <ProtectedRoute>
                                    <LeadEmail />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="register-user"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <UserRegistration />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route
                            path="user-management"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <UserManagement />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App; 
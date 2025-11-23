import React from 'react';
import { Home, Trophy, User, Map } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Home', icon: Home, path: '/student' },
        { name: 'Journey', icon: Map, path: '/student/journey' },

export default BottomNav;

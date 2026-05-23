import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/components/navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">🧘🏻‍♂️ Asana Tree - a yoga journey</div>
      <div className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/workouts"
          className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
        >
          Workouts
        </NavLink>
      </div>
    </nav>
  );
}

"use client";
import {Navbar, Nav, Container} from 'react-bootstrap';
import Link from 'next/link';
import {Person, Gear, List} from 'react-bootstrap-icons';
import React, {useState} from "react";
import Logo from "./Logo";

// Componente da barra de navegação superior (Landing Page)
export default function NavbarSuperiorLP() {
    const [toggled, setToggled] = useState(false); // Estado para controlar se o menu colapsável está aberto

    // Itens do menu (Login e Cadastro)
    const navItems = [
        {href: "/login", icon: <Person/>, label: "Login"},
        {href: "/cadastro", icon: <Gear/>, label: "Cadastro"}
    ];

    return (
        <Navbar expand="lg" className="menu-central">
            <Container fluid className="px-0">
                {/* Logo */}
                <Link href="/" passHref legacyBehavior>
                    <Navbar.Brand className="logo">
                        <Logo/>
                    </Navbar.Brand>
                </Link>

                {/* Botão de toggle para menu colapsável em telas pequenas */}
                <Navbar.Toggle
                    aria-controls="top-navbar"
                    onClick={() => setToggled(!toggled)}
                    className="border-0 me-3"
                >
                    <List size={24}/>
                </Navbar.Toggle>

                {/* Menu de navegação */}
                <Navbar.Collapse id="top-navbar" className="justify-content-end">
                    <Nav as="ul" className="item-menu-central">
                        {navItems.map((item, index) => (
                            <Nav.Item as="li" key={index}>
                                <Link href={item.href} passHref legacyBehavior>
                                    <Nav.Link className="d-flex align-items-center">
                                        {/* Ícone do item */}
                                        {React.cloneElement(item.icon, {className: "me-1"})}
                                        {item.label}
                                    </Nav.Link>
                                </Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

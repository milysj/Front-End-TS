"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Button,
  FormControl,
} from "react-bootstrap";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import BackButton from "./BackButton";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  List,
  Book,
  BarChart,
  BookmarkFill,
  // Envelope,
  BackpackFill,
  HouseDoor,
  Person,
  // ThreeDots,
  Gear,
  Search,
  ArrowLeft, // NOVO: Ícone para fechar a pesquisa mobile
  ChevronDown,
  // Cart,
  Shield,
} from "react-bootstrap-icons";
import { styleEffect } from "framer-motion";

// Componente principal do topo/navegação
const Topo = () => {
  const { t } = useLanguage();
  // Estados para controlar o comportamento do menu lateral e navbar
  const [collapsed, setCollapsed] = useState(true); // Sidebar recolhida ou não
  const [sidebarToggled, setSidebarToggled] = useState(false); // Sidebar aberta no mobile
  const [navbarToggled, setNavbarToggled] = useState(false); // Navbar aberta no mobile
  const [isMobile, setIsMobile] = useState(false); // Se está em tela mobile

  // Estado para a barra de pesquisa
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para controlar a barra de pesquisa no mobile
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { user, logout } = useAuth();
  const tipoUsuario = user?.tipoUsuario || null;

  const router = useRouter();
  const pathname = usePathname();
  const isBuscaPage = pathname === "/busca";

  // Função para fazer logout
  const handleLogout = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    logout();
  };

  // Função para lidar com a pesquisa
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Impede o recarregamento da página
    if (searchTerm.trim() !== "") {
      // Redirecionar para a página de busca com o termo
      router.push(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      // Limpar o campo após a pesquisa
      setSearchTerm("");
      // Fechar a barra de pesquisa móvel após pesquisar
      if (isMobile) {
        setMobileSearchOpen(false);
      }
    }
  };

  // Hook para detectar se está em tela mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    {
      href: "/home",
      icon: <HouseDoor size={20} />,
      label: t("common.home") || "Home",
    },
    {
      href: "/ranking",
      icon: <BarChart size={20} />,
      label: t("common.ranking") || "Ranking",
    },
  ];

  // Itens do dropdown "Perfil" (incluindo itens da sidebar) - Filtrar baseado no tipo de usuário
  const dropdownItems: Array<{
    href: string;
    icon?: React.ReactNode;
    label: string;
    variant?: string;
    onClick?: (e?: React.MouseEvent) => void;
    separator?: boolean; // Indica se deve ter separador antes deste item
  }> = [
    { href: "/perfil", icon: <Person size={18} />, label: t("common.profile") || "Perfil" },
    {
      href: "/configuracoes",
      icon: <Gear size={18} />,
      label: t("common.settings") || "Configurações",
    },
    {
      href: "/meusCursos",
      icon: <Book size={18} />,
      label: t("navigation.myCourses") || "Meus Cursos",
    },
    {
      href: "/salvas",
      icon: <BookmarkFill size={18} />,
      label: t("navigation.savedLessons") || "Lições Salvas",
    },
    // Apenas mostrar "Gerenciar Trilhas" se for PROFESSOR, ADMINISTRADOR ou OWNER
    ...(tipoUsuario === "PROFESSOR" || tipoUsuario === "ADMINISTRADOR" || tipoUsuario === "OWNER"
      ? [
          {
            href: "/gerenciarTrilha",
            icon: <BackpackFill size={18} />,
            label: t("navigation.manageTrails") || "Gerenciar Trilhas",
          },
        ]
      : []),
    // Apenas mostrar "Painel Admin" se for ADMINISTRADOR ou OWNER
    ...(tipoUsuario === "ADMINISTRADOR" || tipoUsuario === "OWNER"
      ? [
          {
            href: "/painel-admin",
            icon: <Shield size={18} />,
            label: t("navigation.adminPanel") || "Painel Admin",
          },
        ]
      : []),
    {
      href: "/consultAi",
      icon: (
        <div
          style={{
            width: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            width={18}
            height={18}
            src="/img/ConsultAi.png"
            alt="ConsultAI"
            style={{ objectFit: "contain" }}
          />
        </div>
      ),
      label: t("navigation.consultAI") || "ConsultAI",
    },
    {
      href: "#",
      label: t("common.logout") || "Sair",
      variant: "danger",
      onClick: handleLogout,
      separator: true,
    },
  ];

  // Fecha o sidebar ao clicar em um link no mobile
  const handleSidebarLinkClick = () => {
    if (isMobile) {
      setSidebarToggled(false);
    }
  };

  return (
    <div className="flex">
      <div
        style={{
          marginLeft: "0px", // Sidebar removida, não precisa mais de margem
          transition: "margin-left 0.3s",
          width: "100%",
        }}
      >
        {/* Navbar superior */}
        <Navbar
          expand="lg"
          className="menu-central"
          style={{
            minHeight: isMobile ? "48px" : "auto",
            padding: isMobile ? "4px 0" : "8px 0",
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1000,
          }}
        >
          <Container
            fluid
            className="px-0"
            style={{
              minHeight: isMobile ? "40px" : "auto",
              display: "flex",
              alignItems: "center",
              height: "100%",
              position: "relative",
              width: "100%",
            }}
          >
            {/* Logo do sistema - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {(!isMobile || (isMobile && !mobileSearchOpen)) && (
              <div
                className="d-flex align-items-center"
                style={{
                  zIndex: 10,
                  position: "relative",
                  flexShrink: 0,
                  gap: isMobile ? "8px" : "16px",
                  marginLeft: isMobile ? "8px" : "20px",
                }}
              >
                {pathname !== "/home" && pathname !== "/" && (
                  <BackButton className="scale-90 md:scale-100" />
                )}
                <Link
                  href="/home"
                  className="d-flex align-items-center"
                  style={{
                    height: "100%",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        transform: isMobile ? "scale(1.10)" : "scale(1.25)",
                        transformOrigin: "left center",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {/* Logo */}
                      <div>
                        <Image
                          width={240}
                          height={128}
                          src="/svg/EstudeMyLogo.svg"
                          alt="Logo"
                          style={{ display: "block" }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Barra de Pesquisa (Desktop) - ALTERADO: Centralizada na navbar, oculta na página de busca */}
            {!isMobile && !isBuscaPage && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "80%",
                  marginLeft: "50px",
                }}
              >
                <Form
                  className="d-flex my-2 my-lg-0"
                  onSubmit={handleSearchSubmit}
                  style={{
                    width: "80%",
                    maxWidth: "500px",
                    margin: 0,
                  }}
                >
                  <FormControl
                    type="search"
                    placeholder={t("search.placeholder") || "Pesquisar..."}
                    className="me-3 mt-1"
                    aria-label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      height: "38px",
                      width: "100%",
                      cursor: "text",
                      backgroundColor: "var(--bg-input)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-color)",
                    }}
                  />
                  <style jsx>{`
                    input::placeholder {
                      color: var(--text-muted) !important;
                      opacity: 0.7;
                    }
                  `}</style>
                  <Button
                    variant="outline-primary"
                    type="submit"
                    style={{
                      height: "38px",
                      padding: "6px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <Search size={18} />
                  </Button>
                </Form>
              </div>
            )}


            {/* NOVO: Barra de Pesquisa (Mobile - Aberta) - Ocultar na página de busca */}
            {isMobile && mobileSearchOpen && !isBuscaPage && (
              <Form
                className="d-flex flex-grow-1"
                onSubmit={handleSearchSubmit}
                style={{ marginLeft: "80px", marginRight: "15px" }}
              >
                {/* Botão de fechar */}
                <Button
                  variant="link"
                  onClick={() => setMobileSearchOpen(false)}
                  className="p-2"
                  style={{ color: 'var(--text-primary)' }}
                  aria-label="Fechar pesquisa"
                >
                  <ArrowLeft size={18} />
                </Button>
                <FormControl
                  type="search"
                  placeholder={t("search.placeholder") || "Pesquisar..."}
                  className="me-2"
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    height: "32px",
                    backgroundColor: "var(--bg-input)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-color)",
                  }}
                  autoFocus // Foca no input ao abrir
                />
                <style jsx>{`
                  input::placeholder {
                    color: var(--text-muted) !important;
                    opacity: 0.7;
                  }
                `}</style>
                <Button
                  variant="outline-primary"
                  type="submit"
                  style={{
                    height: "32px",
                    padding: "4px 8px",
                  }}
                >
                  <Search size={16} />
                </Button>
              </Form>
            )}

            {/* Controles da Direita (Mobile) - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {isMobile && !mobileSearchOpen && (
              <div className="d-flex align-items-center ms-auto">
                {/* NOVO: Botão Ícone de Pesquisa (Mobile - Fechado) - Ocultar na página de busca */}
                {!isBuscaPage && (
                  <Button
                    variant="link"
                    onClick={() => setMobileSearchOpen(true)}
                    className="p-2"
                    style={{ marginRight: "8px", color: 'var(--text-primary)' }}
                    aria-label="Abrir pesquisa"
                  >
                    <Search size={20} />
                  </Button>
                )}


                {/* Botão para abrir navbar no mobile */}
                <Navbar.Toggle
                  aria-controls="top-navbar"
                  onClick={() => setNavbarToggled(!navbarToggled)}
                  className="border-0 me-3"
                  style={{
                    padding: isMobile ? "2px 4px" : "4px 8px",
                    fontSize: isMobile ? "0.9rem" : "1rem",
                  }}
                >
                  <span className="navbar-toggler-icon theme-navbar-icon"></span>
                  <style jsx>{`
                    .theme-navbar-icon {
                      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(31, 41, 55, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
                    }
                    :global(html.dark) .theme-navbar-icon,
                    :global(.dark) .theme-navbar-icon {
                      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(255, 255, 255, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
                    }
                  `}</style>
                </Navbar.Toggle>
              </div>
            )}

            {/* Itens do menu superior - ALTERADO: Esconde se a pesquisa mobile estiver aberta */}
            {(!isMobile || (isMobile && !mobileSearchOpen)) && (
              <Navbar.Collapse
                id="top-navbar"
                className="justify-content-end"
                style={{ zIndex: 100, position: "relative" }}
              >
                <Nav
                  as="ul"
                  className="item-menu-central"
                  style={{
                    alignItems: "center",
                  }}
                >
                  {/* Itens principais do menu */}
                  {navItems.map((item, index) => (
                    <Nav.Item as="li" key={index}>
                      <Link href={item.href}>
                        <Nav.Link
                          as="span" // Evita <a> aninhado
                          className="d-flex align-items-center"
                          onClick={() => setNavbarToggled(false)}
                          style={{
                            padding: isMobile ? "4px 8px" : "8px 12px",
                            fontSize: isMobile ? "0.85rem" : "1rem",
                            minHeight: isMobile ? "32px" : "auto",
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                        >
                          {/* Ícone do item */}
                          {React.cloneElement(item.icon, {
                            className: "me-1",
                            size: isMobile ? 16 : 18,
                          })}
                          {item.label}
                        </Nav.Link>
                      </Link>
                    </Nav.Item>
                  ))}

                  {/* Dropdown "Perfil" (aparece só no desktop) - Usando Radix UI */}
                  {!isMobile && (
                    <Nav.Item as="li">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="d-flex align-items-center nav-link2 border-0 bg-transparent"
                            style={{
                              padding: "10px 15px",
                              cursor: "pointer",
                              color: "inherit",
                            }}

                          >
                            <List className="me-2" size={20} />
                            <ChevronDown
                              size={14}
                              style={{ marginLeft: "4px" }}
                            />
                          </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            sideOffset={5}
                            align="end"
                            className="radix-dropdown-content"
                            style={{
                              backgroundColor: "var(--bg-card)",
                              borderRadius: "6px",
                              padding: "4px",
                              minWidth: "200px",
                              boxShadow: "0 4px 12px var(--shadow-color)",
                              border: "1px solid var(--border-color)",
                              zIndex: 1000,
                              transition: "background-color 0.3s ease, border-color 0.3s ease",
                            }}
                          >
                            {dropdownItems.map((item, index) => (
                              <React.Fragment key={index}>
                                {item.separator && index > 0 && (
                                  <DropdownMenu.Separator
                                    style={{
                                      height: "1px",
                                      backgroundColor: "var(--border-color)",
                                      margin: "4px 0",
                                    }}
                                  />
                                )}
                                {item.onClick ? (
                                  <DropdownMenu.Item
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: "8px 12px",
                                      fontSize: "14px",
                                      cursor: "pointer",
                                      outline: "none",
                                      borderRadius: "4px",
                                      color:
                                        item.variant === "danger"
                                          ? "#dc3545"
                                          : "var(--text-primary)",
                                      transition: "background-color 0.2s ease, color 0.2s ease",
                                    }}
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      item.onClick?.(e as any);
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        item.variant === "danger"
                                          ? "#fee2e2"
                                          : "var(--bg-input)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    {item.icon && (
                                      <span
                                        style={{
                                          marginRight: "8px",
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        {item.icon}
                                      </span>
                                    )}
                                    {item.label}
                                  </DropdownMenu.Item>
                                ) : (
                                  <DropdownMenu.Item asChild>
                                    <Link
                                      href={item.href}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px 12px",
                                        fontSize: "14px",
                                        cursor: "pointer",
                                        textDecoration: "none",
                                        color:
                                          item.variant === "danger"
                                            ? "#dc3545"
                                            : "var(--text-primary)",
                                        borderRadius: "4px",
                                        transition: "background-color 0.2s ease, color 0.2s ease",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          item.variant === "danger"
                                            ? "#fee2e2"
                                            : "var(--bg-input)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "transparent";
                                      }}
                                    >
                                      {item.icon && (
                                        <span
                                          style={{
                                            marginRight: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                          }}
                                        >
                                          {item.icon}
                                        </span>
                                      )}
                                      {item.label}
                                    </Link>
                                  </DropdownMenu.Item>
                                )}
                              </React.Fragment>
                            ))}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </Nav.Item>
                  )}

                  {/* Itens do dropdown "Mais" (aparecem direto no mobile) */}
                  {isMobile &&
                    dropdownItems.map((item, index) => (
                      <React.Fragment key={`mobile-${index}`}>
                        {item.separator && index > 0 && (
                          <Nav.Item as="li">
                            <div
                              style={{
                                height: "1px",
                                backgroundColor: "var(--border-color)",
                                margin: "8px 0",
                              }}
                            />
                          </Nav.Item>
                        )}
                        <Nav.Item as="li">
                          {item.onClick ? (
                            <Nav.Link
                              as="span" // Evita <a> aninhado
                              className={`d-flex align-items-center ${
                                item.variant === "danger" ? "text-danger" : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setNavbarToggled(false);
                                item.onClick?.(e);
                              }}
                              style={{
                                padding: isMobile ? "4px 8px" : "8px 12px",
                                fontSize: isMobile ? "0.85rem" : "1rem",
                                minHeight: isMobile ? "32px" : "auto",
                                cursor: "pointer",
                              }}
                            >
                              {item.icon && (
                                <span className="me-2">{item.icon}</span>
                              )}
                              {item.label}
                            </Nav.Link>
                          ) : (
                            <Link href={item.href}>
                              <Nav.Link
                                as="span" // Evita <a> aninhado
                                className={`d-flex align-items-center ${
                                  item.variant === "danger" ? "text-danger" : ""
                                }`}
                                onClick={() => setNavbarToggled(false)}
                                style={{
                                  padding: isMobile ? "4px 8px" : "8px 12px",
                                  fontSize: isMobile ? "0.85rem" : "1rem",
                                  minHeight: isMobile ? "32px" : "auto",
                                  cursor: "pointer",
                                }}
                              >
                                {item.icon && (
                                  <span className="me-2">{item.icon}</span>
                                )}
                                {item.label}
                              </Nav.Link>
                            </Link>
                          )}
                        </Nav.Item>
                      </React.Fragment>
                    ))}
                </Nav>
              </Navbar.Collapse>
            )}
          </Container>
        </Navbar>
      </div>
    </div>
  );
};

export default Topo;

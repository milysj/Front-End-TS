"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Home,
  BarChart3,
  Book,
  Bookmark,
  Backpack,
  User,
  Settings,
  Search,
  ArrowLeft,
  ChevronDown,
  X,
  Menu,
  LogOut,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Navbar Moderna com Framer Motion
 * - Totalmente responsiva
 * - Barra de pesquisa integrada
 * - Animações suaves
 * - Menu mobile otimizado
 */
const ModernNavbar = () => {
  // Estados
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const isBuscaPage = pathname === "/busca";

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Buscar tipo de usuário
  useEffect(() => {
    const buscarTipoUsuario = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const userData = await res.json();
          setTipoUsuario(userData.tipoUsuario || null);
        }
      } catch (error) {
        console.error("Erro ao buscar tipo de usuário:", error);
      }
    };

    buscarTipoUsuario();
  }, []);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    router.push("/login");
    setTimeout(() => {
      window.location.href = "/login";
    }, 100);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  // Menu items
  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/ranking", icon: BarChart3, label: "Ranking" },
  ];

  // Dropdown items
  const dropdownItems: Array<{
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    variant?: "danger";
    onClick?: () => void;
    separator?: boolean;
    customIcon?: React.ReactNode;
  }> = [
    { href: "/perfil", icon: User, label: "Perfil" },
    { href: "/configuracoes", icon: Settings, label: "Configurações" },
    {
      href: "/meusCursos",
      icon: Book,
      label: "Meus Cursos",
      separator: true,
    },
    { href: "/salvas", icon: Bookmark, label: "Lições Salvas" },
    ...(tipoUsuario === "PROFESSOR" || tipoUsuario === "ADMINISTRADOR"
      ? [
          {
            href: "/gerenciarTrilha",
            icon: Backpack,
            label: "Gerenciar Trilhas",
          },
        ]
      : []),
    {
      href: "/consultAi",
      icon: Bot,
      label: "ConsultAI",
      customIcon: (
        <Image
          width={16}
          height={16}
          src="/img/ConsultAi.png"
          alt="ConsultAI"
          className="object-contain"
        />
      ),
    },
    {
      href: "#",
      icon: LogOut,
      label: "Sair",
      variant: "danger",
      onClick: handleLogout,
      separator: true,
    },
  ];

  // Animações
  const navAnimation = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  };

  const menuAnimation = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  };

  const itemAnimation = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.2 },
  };

  const searchAnimation = {
    initial: { width: 0, opacity: 0 },
    animate: { width: "100%", opacity: 1 },
    exit: { width: 0, opacity: 0 },
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  };

  return (
    <motion.nav
      {...navAnimation}
      className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm"
    >
      <div className="w-full">
        {/* Layout Desktop: Logo esquerda, Pesquisa centro, Menu direita */}
        <div className="hidden lg:flex lg:items-center lg:h-16 md:lg:h-20 lg:relative w-full">
          {/* Logo - Canto Esquerdo (próximo à borda) */}
          <div className="flex items-center justify-start flex-shrink-0 pl-2">
            <AnimatePresence mode="wait">
              {!isBuscaPage && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <Link
                    href="/home"
                    className="flex items-center transition-opacity hover:opacity-80"
                  >
                    <div className="h-10 md:h-14 w-auto">
                      <Image
                        width={240}
                        height={128}
                        src="/svg/EstudeMyLogo.svg"
                        alt="Logo"
                        className="h-full w-auto object-contain"
                        priority
                      />
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Barra de Pesquisa - Centro Absoluto */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            {!isBuscaPage ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-2xl"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="w-full flex items-center gap-2"
                >
                  <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar lições, trilhas..."
                      className="pl-10 pr-4 h-10 w-full"
                    />
                  </div>
                  <Button type="submit" size="default" className="h-10 px-4 flex-shrink-0">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Menu e Dropdown - Canto Direito (próximo à borda) */}
          <div className="flex items-center justify-end flex-shrink-0 ml-auto pr-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              {/* Menu Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "gap-2",
                        isActive && "bg-blue-50 text-blue-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Dropdown Perfil */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    sideOffset={8}
                    align="end"
                    className="radix-dropdown-content bg-white rounded-lg shadow-lg border border-gray-200 p-1 min-w-[200px] z-50"
                  >
                    {dropdownItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <React.Fragment key={index}>
                          {item.separator && index > 0 && (
                            <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
                          )}
                          {item.onClick ? (
                            <DropdownMenu.Item
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors",
                                item.variant === "danger" &&
                                  "text-red-600 hover:bg-red-50 focus:bg-red-50"
                              )}
                              onSelect={(e) => {
                                e.preventDefault();
                                item.onClick?.();
                              }}
                            >
                              {item.customIcon ? (
                                <span className="h-4 w-4 flex items-center justify-center">
                                  {item.customIcon}
                                </span>
                              ) : (
                                <Icon className="h-4 w-4" />
                              )}
                              <span>{item.label}</span>
                            </DropdownMenu.Item>
                          ) : (
                            <DropdownMenu.Item asChild>
                              <Link
                                href={item.href}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md outline-none hover:bg-gray-100 focus:bg-gray-100 transition-colors no-underline text-gray-700"
                              >
                                {item.customIcon ? (
                                  <span className="h-4 w-4 flex items-center justify-center">
                                    {item.customIcon}
                                  </span>
                                ) : (
                                  <Icon className="h-4 w-4" />
                                )}
                                <span>{item.label}</span>
                              </Link>
                            </DropdownMenu.Item>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </motion.div>
          </div>
        </div>

        {/* Layout Mobile: Flex normal */}
        <div className="lg:hidden flex items-center h-16 md:h-20 w-full">
          {/* Logo - Canto Esquerdo (encostado) */}
          <AnimatePresence mode="wait">
            {!searchOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <Link
                  href="/home"
                  className="flex items-center transition-opacity hover:opacity-80"
                >
                  <div className="h-10 md:h-14 w-auto">
                    <Image
                      width={240}
                      height={128}
                      src="/svg/EstudeMyLogo.svg"
                      alt="Logo"
                      className="h-full w-auto object-contain"
                      priority
                    />
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barra de Pesquisa Mobile */}
          <AnimatePresence>
            {searchOpen && !isBuscaPage && (
              <motion.div
                {...searchAnimation}
                className="flex-1 flex items-center px-2"
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex-1 flex items-center gap-2"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={closeSearch}
                    className="flex-shrink-0"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Input
                    ref={searchInputRef}
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Pesquisar..."
                    className="flex-1 h-9"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="flex-shrink-0 h-9 w-9"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controles Mobile - Canto Direito (encostado) */}
          {!searchOpen && (
            <div className="flex items-center gap-2 ml-auto lg:hidden">
              {/* Botão Pesquisa */}
              {!isBuscaPage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openSearch}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* Ícone de pesquisa centralizado - Página de busca */}
              {isBuscaPage && (
                <div className="absolute left-1/2 transform -translate-x-1/2">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
              )}

              {/* Botão Menu */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Menu Mobile Colapsado */}
        <AnimatePresence>
          {isMobile && isOpen && !searchOpen && (
            <motion.div
              {...menuAnimation}
              className="lg:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col space-y-1 py-2">
                {/* Menu Items */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div key={item.href} {...itemAnimation}>
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 h-12",
                            isActive && "bg-blue-50 text-blue-600"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-base">{item.label}</span>
                        </Button>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Separador */}
                <div className="h-px bg-gray-200 my-2" />

                {/* Dropdown Items */}
                {dropdownItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <React.Fragment key={`mobile-${index}`}>
                      {item.separator && index > 0 && (
                        <div className="h-px bg-gray-200 my-2" />
                      )}
                      <motion.div {...itemAnimation}>
                        {item.onClick ? (
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              setIsOpen(false);
                              item.onClick?.();
                            }}
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-12 text-left",
                              item.variant === "danger" &&
                                "text-red-600 hover:bg-red-50"
                            )}
                          >
                            {item.customIcon ? (
                              <span className="h-5 w-5 flex items-center justify-center">
                                {item.customIcon}
                              </span>
                            ) : (
                              <Icon className="h-5 w-5" />
                            )}
                            <span className="text-base">{item.label}</span>
                          </Button>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                          >
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 h-12 text-left"
                            >
                              {item.customIcon ? (
                                <span className="h-5 w-5 flex items-center justify-center">
                                  {item.customIcon}
                                </span>
                              ) : (
                                <Icon className="h-5 w-5" />
                              )}
                              <span className="text-base">{item.label}</span>
                            </Button>
                          </Link>
                        )}
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default ModernNavbar;

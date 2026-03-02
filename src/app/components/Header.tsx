"use client";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header>
            {/* Menu principal */}
            <nav className="menu-central">
                {/* Logo personalizado com cada letra como span */}
                <div className="logo">
                    <span className="E">E</span>
                    <span className="S">S</span>
                    <span className="T">T</span>
                    <span className="U">U</span>
                    <span className="D">D</span>
                    <span className="E2">E</span>
                    <span className="ponto">.</span>
                    <span className="M">M</span>
                    <span className="Y">Y</span>
                </div>

                {/* Itens do menu */}
                <ul className="item-menu-central">
                    <li>
                        <Link href="/main_page" legacyBehavior>
                            <span>🏠</span> Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/index_perfil" legacyBehavior>
                            <span>👤</span> Perfil
                        </Link>
                    </li>
                    <li>
                        <Link href="/config" legacyBehavior>
                            <span>⚙️</span> Configurações
                        </Link>
                    </li>

                    {/* Dropdown "Mais" */}
                    <li className="dropdown">
                        <a href="#">Mais ▾</a>
                        <div className="dropdown-menu">
                            <Link href="/conta">Conta</Link>
                            <Link href="/ConsultAi">Sobre Nós</Link>
                            <Link href="/fale_conosco">Fale Conosco</Link>
                            <Link href="/FAQ">FAQ</Link>
                            <Link href="/index_LP">Sair</Link>
                        </div>
                    </li>
                </ul>
            </nav>

            {/* Área do usuário */}
            <div className="user">
                <span>Olá, Aluno!</span>
                <Image
                    width={50}
                    height={50}
                    src="/img/guerreiro.png"
                    alt="Avatar"
                    className="card-img"
                />
            </div>
        </header>
    );
}


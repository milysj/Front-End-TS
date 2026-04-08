🎓 EstudeMy - FrontEnd
O EstudeMy é uma plataforma de estudos gamificada, criada para tornar o aprendizado mais dinâmico e envolvente para jovens e estudantes. Professores podem disponibilizar seus cursos, aulas e conteúdos personalizados, enquanto alunos exploram diferentes trilhas de aprendizado, acumulam pontos, conquistas e medalhas conforme avançam nos estudos.

📝 Sobre o Projeto
O EstudeMy é uma plataforma de estudos gamificada, desenvolvida para incentivar o aprendizado de forma interativa e divertida. A aplicação fornece uma API RESTful completa que gerencia usuários, cursos, progresso e interações entre alunos e professores.

O backend garante segurança, escalabilidade e integração simples com o frontend desenvolvido em React/Next.js, permitindo que o sistema evolua continuamente com novas funcionalidades educacionais.

Principais recursos:

Cadastro e autenticação de usuários (alunos e professores)
CRUD de cursos, aulas e trilhas de aprendizado
Sistema de pontuação e conquistas gamificadas
Monitoramento de progresso e desempenho dos alunos
Integração com banco de dados MongoDB
Documentação interativa via Swagger UI
Hospedagem e deploy automatizado em nuvem

👨‍💻 Colaboradores
Nome	Função

João Milone	💻 Frontend - Backend Developer

João Quaresma	💻 Frontend - Backend Developer

Gabriel Lupateli	👨‍💻 Product Owner

Beatriz Siqueira	👩‍💻 Scrum Master

Wallacy José	🧑‍💻 Frontend Devoloper

## Docker

Na raiz do repositório **Front-End-TS**, com Docker instalado:

```bash
# Gerar a imagem
docker build -t estudemy-frontend:latest .

# Subir um container (ajuste a porta se precisar)
docker run --rm -p 3000:3000 estudemy-frontend:latest
```

A aplicação fica em `http://localhost:3000`. O build usa o modo `standalone` do Next.js (definido em `next.config.ts`).

Para apontar a API, use variáveis de ambiente do Next no momento do `docker run`, por exemplo `-e NEXT_PUBLIC_API_URL=https://sua-api...` (conforme as variáveis que o projeto utilizar).

**Stack completo (Mongo + API + este frontend):** use o `docker-compose.yml` na raiz do repositório **Back-End-TS** (irmão deste projeto); ele faz o build do frontend com `NEXT_PUBLIC_API_URL=http://localhost:5000`.

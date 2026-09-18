# Fontes e decisões editoriais

## Material examinado

- `about-me/public/eu-igor/index.md`: perfil e experiência profissional, além de análises técnicas de Care Copilot, PixelPhone, Fala Comigo, Grau Técnico, Jarvis, MailWorks e vibe-git.
- `about-me/public/eu-igor/curriculo.pdf`: currículo mais recente anexado, incluindo os períodos freelance, formação prevista para dezembro de 2026, métricas de operação e links de repositórios.
- `about-me/public/eu-igor/redes-sociais.md`: destino explícito dos links sociais.
- READMEs anexados em `about-me/public/projetos/`: leitura do funcionamento, responsabilidades, limitações e arquivos visuais citados.
- PDFs de pesquisa: apresentação sobre classificação de diabetes; certificado de apresentação do trabalho no ENMC em 2024; resolução de aprovação do projeto de reaproveitamento de TV boxes.
- Imagens anexadas: retrato, marcas e capturas de Care Copilot, Fala Comigo, PixelPhone, Jarvis, MailWorks e vibe-git. Cópias otimizadas em WebP ficam em `public/images/`; os originais foram preservados.

## Conciliação das fontes

- **LinkedIn:** usado o link explícito de `redes-sociais.md`, com sufixo `30b751304`, em vez do endereço abreviado diferente no currículo.
- **Formação:** apresentada como em conclusão, com previsão de dezembro de 2026. Nenhuma certificação profissional foi inferida de estudo de AWS.
- **MailWorks:** a barreira de duplicidade atual verifica jobs `SENT`. Não é descrita como exactly-once. Outbox, prioridade de filas e chave de idempotência HTTP aparecem somente como evoluções propostas.
- **Jarvis:** o README específico descreve autenticação M2M com `x-admin-key`, refinando a afirmação antiga de endpoints protegidos apenas pela rede. A integração Securo não é apresentada como implementação autoral de seu motor financeiro. Uma restrição única de ocorrência não é chamada de bloqueio pessimista.
- **Fala Comigo:** preservada a distinção entre capacidades do produto colaborativo e entregas autorais documentadas no histórico Git. AES-256-GCM é descrito como proteção em repouso, sem afirmar E2EE.
- **PixelPhone:** BullMQ é atribuído à auditoria e aos logs, sem inferir que toda a análise de voz já ocorre em fila.
- **vibe-git:** o nome npm segue o README mais recente: `@igoralbuquerque/vibe-git`. Uso por 10 colaboradores e economia aproximada são relatos fornecidos, não benchmarks verificados externamente. Execução Git não é descrita como transação com rollback.
- **Pesquisa:** o documento do ENMC comprova apresentação, mas não contém o artigo. O PDF das TV boxes é uma resolução institucional, não uma publicação científica. Esses tipos estão explícitos nos links.
- **Figuras ausentes:** alguns READMEs citam screenshots e diagramas cujos arquivos não acompanham `about-me/`. Não foram inventadas telas de produto. Fluxos simplificados próprios são derivados da descrição técnica; as imagens existentes e placeholders completam as galerias.

## Inventário anterior preservado

O frontend antigo continha dois projetos adicionais que não têm documentação detalhada em `about-me/`. Ambos foram mantidos a pedido de incluir todos os projetos encontrados. Os registros antigos foram reescritos; as informações disponíveis são:

- **MovieWish:** projeto concluído, aplicativo Flutter para descobrir filmes por gênero, criar watchlist e receber sugestões por afinidade. Stack informada: Flutter, NestJS e API de filmes. Nenhuma URL de repositório fornecida.
- **Transaction API:** projeto concluído baseado em desafio técnico do Itaú, com testes unitários, testes de carga, logs e observabilidade. Stack informada: JavaScript, Jest, Artillery e Winston. Nenhum resultado de benchmark ou URL de repositório fornecido.

As demais frentes complementares vêm do relato profissional: CRM, agente comercial, ingestão, eventos, biodigestores, e-commerce e portais institucionais. As pesquisas também aparecem no catálogo, ligadas aos anexos, além da seção editorial de artigos.

## Limite das afirmações

O site apresenta informações fornecidas pelo autor. Não houve auditoria dos repositórios externos, validação independente das métricas de negócio ou inferência de certificações, empregadores, senioridade e datas não informadas.

# Mary Cakes Confeitaria — Landing Page (Fase 1)

Landing page institucional e de captação de pedidos para a **Mary Cakes Confeitaria**
(Marinalva Souza), construída em **HTML + CSS + JavaScript puro** — sem build, sem
dependências, sem framework.

---

## Como rodar

Basta abrir o `index.html` no navegador. Para testar o mapa e os caminhos relativos
corretamente, prefira um servidor local:

```bash
python -m http.server 5173
```

Depois acesse `http://localhost:5173`.

---

## Como publicar

Suba **estes arquivos** para a raiz da hospedagem:

```
index.html
robots.txt
sitemap.xml
site.webmanifest
.htaccess          ← só em Apache/cPanel
_headers           ← só em Netlify/Cloudflare Pages
assets/
```

> Suba **um** dos dois: `.htaccess` (Apache/cPanel/hospedagem compartilhada) **ou**
> `_headers` (Netlify/Vercel/Cloudflare Pages). O outro pode ficar de fora.

**Não suba** `Fotos/`, `Fotos-2/`, `perfil_instagram/`, `.claude/` nem este `README.md` — são
material de origem e configuração local.

Funciona em qualquer hospedagem estática: Netlify, Vercel, GitHub Pages, Cloudflare Pages,
ou hospedagem compartilhada tradicional (cPanel/FTP).

### Cache dos assets

O CSS e o JS são chamados com versão (`style.css?v=6.0.0`). **Sempre que editar um deles,
incremente esse número no `index.html`** — senão o navegador de quem já visitou continua
servindo a versão antiga.

### Antes de publicar: trocar o domínio

O domínio `marycakesconfeitaria.com.br` está usado como **placeholder**. Substitua pelo domínio
real em 4 lugares:

| Arquivo | O que trocar |
|---|---|
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` |
| `index.html` | bloco JSON-LD (`url`, `image`, `logo`) |
| `robots.txt` | linha `Sitemap:` |
| `sitemap.xml` | `<loc>` |

---

## Dados da marca usados no site

Todos extraídos do perfil do Instagram e das fotos fornecidas:

- **Nome:** Mary Cakes Confeitaria — *desde 2016*
- **Proprietária:** Marinalva Souza
- **Endereço:** Rua Nossa Senhora das Candeias, 489 — São Paulo/SP, 08247-056
- **Horário:** Terça a domingo, 11h30 às 19h30 (segunda fechado)
- **WhatsApp / telefone:** (11) 98861-8505 → `wa.me/5511988618505`
- **Instagram:** [@marycakes_confeitaria](https://www.instagram.com/marycakes_confeitaria)
- **Facebook:** Mary Souza

---

## Design system

A paleta foi **amostrada diretamente das fotos** (fachada, logo e cenário dos posts):

| Token | Cor | Origem |
|---|---|---|
| `--pink-500` | `#E8388F` | rosa vibrante da fachada — cor primária |
| `--pink-700` | `#AB1860` | magenta da borda serrilhada do logo |
| `--violet-600` | `#6B4E9B` | roxo do letreiro "Mary Cakes" |
| `--pink-100` | `#FDE8F0` | rosa blush da parede de fundo dos posts |
| `--gold` | `#C9A227` | detalhe dourado dos bolos |
| `--ink` | `#2C1420` | texto |

**Tipografia**
- `Parisienne` — wordmark, ecoando o script cursivo da placa da loja
- `Playfair Display` — títulos (serifada elegante)
- `Poppins` — corpo e interface

---

## Estrutura da página

1. Header fixo com navegação, **botão do Instagram** e CTA de WhatsApp
2. **Hero** — 3 molduras com **slideshow automático** (19 fotos selecionadas) + selo "2016"
3. **Números** — 2016 · +1.000 criações · +1.800 seguidores · 6 dias por semana
4. **Especialidades** — 11 cards com foto, por categoria
5. **Também sob encomenda** — 3 categorias ainda sem foto (ícone + CTA)
6. **Direto da vitrine** — **carrossel** com 15 produtos (arraste ou setas)
7. **Galeria** — 59 fotos com filtro por 10 categorias e lightbox (teclado + swipe)
8. **Sobre a Mary** — composição animada: quadro principal + 2 recortes flutuantes, todos com slideshow
9. **Como encomendar** — 4 passos ao lado da arte ilustrada da marca
10. **A loja** — endereço, horários, contato e mapa do Google
11. **Faixa do Instagram** — CTA para seguir o perfil
12. **Compromisso social** — **vídeo** da entrega ao Instituto TEA Tatuapé + pedidos institucionais
13. **Dúvidas frequentes** — 8 perguntas em accordion
14. CTA final + rodapé + botão flutuante de WhatsApp

### Componentes interativos

| Componente | Comportamento |
|---|---|
| **Status aberto/fechado** | Calculado ao vivo pelo horário Ter–Dom 11h30–19h30, **sempre no fuso de São Paulo** (o visitante pode estar em outro lugar). Mostra "Aberto agora · até 19h30", "Fecha em 45 min" (última hora, em dourado) ou "Fechado · abre terça às 11h30". Atualiza a cada minuto. Aparece no header (versão curta), no hero e na seção da loja. |
| **Vídeo do Instituto TEA** | Registro real da entrega do bolo de aniversário, na seção de compromisso social. `preload="none"` + poster: os 2,9 MB só baixam se a pessoa der play. |
| **Slideshows** | 6 no total: 3 no hero (4,2s / 5,3s / 6,1s) e 3 na seção Sobre (5,0s / 3,8s / 4,6s). Intervalos diferentes de propósito para não sincronizar. Pausam com a aba oculta e com o lightbox aberto; ficam estáticos com `prefers-reduced-motion`. |
| **Carrossel da vitrine** | Scroll-snap nativo. Setas no desktop (desabilitam nas pontas), arrasto no celular. Navegável por teclado. |
| **Galeria** | 10 filtros de categoria, 59 fotos. Abre com 12 e cresce no "Ver mais (+47)" — corta muito a rolagem do mobile. |
| **Lightbox** | Funciona em **4 grupos**: galeria (59), especialidades (11), vitrine (15) e Sobre (3). Clicar em qualquer foto do site abre ampliada. Contador respeita o filtro ativo, pré-carrega a próxima, setas, `Esc`, swipe e foco preso. Nos slideshows, abre exatamente a foto que estava visível — e **congela as trocas** enquanto estiver aberto. |
| **Voltar ao topo** | Aparece após 1,2 tela de rolagem, empilhado acima do botão do WhatsApp. |
| **Fade-in das fotos** | As imagens surgem suavemente ao carregar. Só ativa se o JS rodar (`<html class="js">`) — sem JS elas aparecem normalmente, e há um timeout de segurança. |

### Categorias

**Com foto real — 11 cards + 10 filtros na galeria:** bolos de festa personalizados · bolos
decorados clássicos · bolos caseiros · tortas gourmet · copo da felicidade · bombom de uva ·
morango do amor e trufados · salgados · **ovos de colher de Páscoa** · **cones trufados** ·
**cestas de presente**.

**Sem foto ainda (bloco "Também sob encomenda", só texto + CTA):** buquê de chocolate ·
bolo no pote · pedidos institucionais.

### Ovos de colher — catálogo real

Extraído do encarte de Páscoa da Mary. Nove opções de **500 g**, todas com caixa personalizada:

| Sabor | Descrição |
|---|---|
| Brigadeiro trufado | O clássico, com muito recheio de brigadeiro cremoso |
| Choco Ninho | Casca de chocolate, recheio de Ninho e Nutella, brigadeiro de ninho e fios de Nutella |
| Surpresa de uva | Creme suave, chocolate cremoso, uvas frescas e fios de Nutella |
| Choco trufado | Recheio cremoso de chocolate, brigadeiros e um morango |
| Kinder Bueno | Recheio cremoso com pedacinhos crocantes |
| Kinder gourmet | Kinder Bueno com Nutella e creme Kinder artesanal |
| Ferrero Rocher | A crocância e o sabor do Ferrero em cada mordida |
| Trufado de morango | Brigadeiro gourmet de morango, granulé e morangos frescos |
| Kids | Ovo + bisnagas de creme e confetes para a criança decorar |

**Política (do próprio encarte):** produção artesanal e limitada · reserva antecipada ·
validade de 4 a 5 dias · desconto acima de 10 unidades · **pedido confirmado com 50% de sinal**.

> Os preços do encarte (R$ 90 e R$ 98) **não foram publicados** — são de uma Páscoa passada e
> provavelmente estão desatualizados. Confirme com a Mary antes de exibir qualquer valor.

---

## Conversão

Todos os CTAs abrem o WhatsApp com **mensagem pré-preenchida e contextual**. Exemplos:

- Card de bolo de festa → *"Olá, Mary! Quero um bolo de festa personalizado. O tema é: "*
- Botão da seção "Como pedir" → abre um roteiro com Data / Tema / Quantas pessoas / Recheio
- Bolos caseiros → *"Quais bolos caseiros têm hoje?"*

Isso reduz o atrito e faz o pedido chegar já organizado.

---

## SEO e técnica

### Auditoria — o que foi corrigido

| Item | Antes | Depois |
|---|---|---|
| `<title>` | 77 caracteres (Google cortava) | **53** — cabe inteiro no resultado |
| `<meta description>` | 203 caracteres (cortada) | **150** — cabe inteira |
| `<h1>` | "Bolos que transformam datas em memórias" — zero palavra-chave | "**Bolos artesanais** que transformam datas em memórias" |
| Schema FAQPage | ausente | **8 perguntas** marcadas — elegível a resultado rico |
| `hasMap` / `areaServed` | ausentes | adicionados ao `Bakery` |
| Sitemap | 1 URL, sem imagens | **12 imagens** com `image:title` (Google Imagens) |
| `logo.webp` | 45,6 KB (512px para exibir a 52px) | **8,7 KB** (160px) — −81% |

### Estado atual

- **1 `<h1>`**, 10 `<h2>`, 37 `<h3>` — hierarquia correta
- **118 imagens, 0 sem `alt`**; as 3 com `alt=""` são decorativas de propósito
- **Só 85 KB carregam sem rolagem** (logo + imagem do hero). O resto é `lazy`
- **2 blocos JSON-LD válidos**: `Bakery` (endereço, horários, fundadora, 12 seções de menu,
  mapa, área atendida) e `FAQPage`
- CSS 49 KB · JS 16 KB · HTML 91 KB (comprimidos pelo `.htaccess`, caem para ~1/5)

---

### Detalhes técnicos

- Meta tags em pt-BR, Open Graph e Twitter Card (imagem 1200×630 gerada)
- **JSON-LD Schema.org `Bakery`** com endereço, geolocalização textual, horários,
  telefone, fundadora e seções de menu — alimenta o Google Business e a busca local
- `sitemap.xml`, `robots.txt` e `site.webmanifest` (PWA instalável)
- Favicon, apple-touch-icon e ícones 192/512 gerados a partir do logo
- Todas as imagens em **WebP**, com `width`/`height` declarados e `loading="lazy"`
- Acessibilidade: skip link, `aria-expanded`/`aria-selected`, foco visível, foco preso no
  lightbox, `alt` descritivo em todas as fotos, respeito a `prefers-reduced-motion`
- Zero dependências JS; único recurso externo são as fontes do Google

---

## Segurança

### Superfície de ataque do próprio site: praticamente nula

Auditado no código, não por suposição:

| Item | Resultado |
|---|---|
| `innerHTML`, `eval`, `document.write`, `new Function` | **nenhum** — todas as escritas no DOM usam `textContent` |
| Handlers inline (`onclick=`, `onload=`…) | **nenhum** |
| URLs `javascript:` | **nenhuma** |
| Formulários / campos de entrada | **nenhum** — não há dado de usuário para injetar |
| Cookies, `localStorage`, `sessionStorage` | **nenhum** |
| Links `target="_blank"` com `rel="noopener"` | **30 de 30** (protege contra *tabnabbing*) |

Sem entrada de usuário e sem escrita de HTML, não há vetor de XSS no código da página.

### Cabeçalhos configurados (`.htaccess` / `_headers`)

| Cabeçalho | O que protege |
|---|---|
| `Content-Security-Policy` | Bloqueia script/estilo/imagem de qualquer origem não autorizada |
| `Strict-Transport-Security` | Força HTTPS por 1 ano |
| `X-Content-Type-Options: nosniff` | Impede o navegador de "adivinhar" o tipo do arquivo |
| `X-Frame-Options` + `frame-ancestors` | Anti-clickjacking (o site não pode ser embutido em outro) |
| `Referrer-Policy` | Não vaza a URL completa para sites externos |
| `Permissions-Policy` | Desliga câmera, microfone, localização e pagamento |

Também: HTTPS forçado por redirect 301, listagem de diretório desativada, e bloqueio das
pastas de origem (`Fotos/`, `Fotos-2/`, `perfil_instagram/`, `.claude/`) caso subam por engano.

### A CSP foi testada, não só escrita

Subi um servidor local aplicando os mesmos cabeçalhos e carreguei o site: **zero violações**,
83 imagens, as 3 fontes do Google e o mapa funcionando.

⚠️ **Dois pontos de atenção ao editar:**

1. A CSP libera o único `<script>` inline do `index.html` por **hash**
   (`sha256-riitXBKGtl5y5ccA7GF6ccqJuwEVP5tm8j0ff/fbw9U=`). Se aquele script mudar,
   **o hash muda e ele para de rodar**. Recalcule com:
   ```bash
   python -c "import hashlib,base64;print('sha256-'+base64.b64encode(hashlib.sha256(b'document.documentElement.className += \" js\";').digest()).decode())"
   ```
2. O `.htaccess` declara `AddType image/webp .webp` **de propósito**. Servidores antigos não
   conhecem WebP e mandam `application/octet-stream`; combinado com `nosniff`, o navegador
   **recusa exibir a imagem** e o site fica sem foto nenhuma. Descobri exatamente isso durante
   o teste — não remova essa linha.

### O que fica fora do nosso controle

- **Google Fonts** e **Google Maps** recebem o IP de quem visita. Para LGPD rigorosa, dá para
  hospedar as fontes localmente e trocar o mapa por um link/imagem estática. Hoje o site
  **não coleta nem armazena nenhum dado pessoal**.
- **Certificado SSL** e atualizações do servidor são responsabilidade da hospedagem. Só ative
  o HSTS depois de confirmar que o HTTPS funciona — ele é irreversível por 1 ano no navegador
  de quem já visitou.

---

## Tratamento das imagens

**45 fotos**, todas vindas de capturas de tela do Instagram (posts e stories), com setas de
carrossel, indicadores de página, molduras pretas, cabeçalho de story e adesivos por cima.
Processamento aplicado:

- recorte dos artefatos da interface do Instagram, **caixa por caixa**;
- as colagens "Layout" (2 fotos numa story) foram **separadas em duas imagens**;
- duas saídas por foto — `*-card.webp` (800×1000, para os cards) e `*.webp` (até 1200 px, para
  o lightbox);
- enquadramento ajustado individualmente para preservar os toppers dos bolos e escapar de
  textos e adesivos.

Total: ~6 MB para as 90 imagens de produto. Os originais continuam intactos em `Fotos/` e
`Fotos-2/`.

---

## O que precisa da sua decisão na Fase 3

Itens deixados de fora **de propósito**, por falta de informação confirmada:

1. **Fotos que ainda faltam.** Só três categorias seguem sem imagem: **buquê de chocolate**,
   **bolo no pote** e uma foto para **pedidos institucionais**. Assim que enviar, viram cards
   com foto como as outras onze.
2. **Depoimentos.** Nenhum foi criado — inventar avaliação de cliente seria conteúdo falso.
   Se você exportar os relatos reais do destaque "Clientes" do Instagram, monto a seção.
3. **Preços.** Conforme sua escolha, o site não exibe valores e direciona ao WhatsApp. Os
   preços do encarte de Páscoa foram deliberadamente omitidos (ver acima).
4. **Confirmar a política de pedido.** O FAQ agora diz que o pedido é confirmado com **50% de
   sinal** — isso veio do encarte de Páscoa, onde estava escrito para aquela linha. **Confirme
   com a Mary se vale para todas as encomendas**; se for só para sazonais, o texto já está
   redigido dessa forma, mas vale checar.
5. **Prazo de encomenda e área de entrega.** Continuam remetendo ao WhatsApp — ainda não tenho
   esses dados.
6. **Sabores dos demais produtos.** Já tenho os nove ovos de Páscoa e as tortas (Nutella,
   holandesa, frutas vermelhas, morango, limão). Faltam os recheios dos bolos de festa e os
   sabores completos do copo da felicidade.
7. **Domínio.** Trocar o placeholder (ver tabela acima).
8. **Google Business.** Vincular o perfil ao site potencializa muito o JSON-LD já embutido.
9. **Pixel / Analytics.** Nenhum rastreador foi instalado. Se quiser Google Analytics ou Meta
   Pixel, é só pedir.

### Uma observação sobre a foto das empadinhas

É a única do lote com qualidade abaixo das demais — foi tirada dentro do forno, escura e com
pouco contraste. Ela está no site (categoria Salgados), mas uma foto nova da empadinha pronta,
na bancada, renderia bem mais.

---

## Observação legal

Os bolos temáticos reproduzem personagens e escudos de terceiros por encomenda do cliente.
Já existe uma nota sobre isso no rodapé. Se preferir uma redação diferente ou remover as fotos
com marcas de terceiros da galeria, é um ajuste rápido.

---

## Arquivos

```
index.html                    página completa (uma só)
robots.txt · sitemap.xml · site.webmanifest
.htaccess                     cabeçalhos de segurança (Apache/cPanel)
_headers                      cabeçalhos de segurança (Netlify/Cloudflare)
assets/css/style.css          design system + todas as seções
assets/js/main.js             menu, scroll spy, reveal, filtros, lightbox, FAQ
assets/img/                   logo, ícones, fachada, OG image
assets/img/produtos/          59 fotos × 2 versões (card e ampliada)
assets/img/mary-retrato.webp  retrato real da Mary
assets/img/mary-arte.webp     arte ilustrada da marca
assets/video/                 vídeo da entrega ao Instituto TEA (2,9 MB)
Fotos/  Fotos-2/              material de origem — NÃO publicar
perfil_instagram/             material de origem — NÃO publicar
.claude/                      config local — NÃO publicar
```

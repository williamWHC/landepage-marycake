# -*- coding: utf-8 -*-
"""
Mary Cakes — processador de fotos
=================================

Transforma as fotos de `fotos-origem/` nas imagens que o site usa,
em `assets/img/produtos/`. Cada foto vira dois arquivos:

    <slug>-card.webp   800x1000  -> cards e miniaturas da galeria
    <slug>.webp        ate 1200px -> imagem ampliada do lightbox

COMO USAR
---------
Processar tudo que esta no manifesto:

    python ferramentas/build-fotos.py

Processar só fotos novas (as que estão nas pastas mas ainda não no
manifesto). Ele registra no manifesto e imprime o HTML pronto para colar:

    python ferramentas/build-fotos.py --novas

Reprocessar uma foto só (depois de ajustar o recorte no manifesto):

    python ferramentas/build-fotos.py --slug bolo-masha

ONDE COLOCAR FOTO NOVA
----------------------
Jogue o arquivo na pasta da categoria, dentro de `fotos-origem/`:

    01-bolos-festa      06-doces
    02-bolos-classicos  07-pascoa
    03-bolos-caseiros   08-presentes
    04-tortas           09-salgados
    05-copos            10-loja-e-equipe

Use nome em minúsculo, sem acento e sem espaço — ele vira o "slug" da
foto no site. Ex.: `bolo-red-velvet.png`. Depois rode `--novas`.

DUAS EXCEÇÕES ao `--novas`:
  * arquivo começando com `_` é ignorado (cardápio, arte, material de apoio);
  * a pasta `10-loja-e-equipe` inteira é ignorada — são as fotos da marca
    (retrato da Mary, fachada, vídeo), que entram em lugares fixos do site
    e não na galeria de produtos.

AJUSTE FINO
-----------
Se o recorte automático cortar mal, edite `ferramentas/manifesto.json`:

    "recorte": [x1, y1, x2, y2]   pixels na foto original, ou null
    "enquadramento": [ax, ay]     0..1. ay baixo mostra mais do topo
                                  (útil para não cortar topper de bolo)

e rode `--slug <nome>` para refazer só ela.
"""
import os, sys, json, unicodedata
from PIL import Image, ImageFilter

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = os.path.join(RAIZ, "fotos-origem")
MANIFESTO = os.path.join(RAIZ, "ferramentas", "manifesto.json")

CARD = (800, 1000)          # proporção 4:5 dos cards
GRANDE = (1200, 1500)       # limite da imagem ampliada
EXTENSOES = (".png", ".jpg", ".jpeg", ".webp")

# categoria do filtro da galeria, por pasta
CATEGORIA = {
    "01-bolos-festa": "festa", "02-bolos-classicos": "classicos",
    "03-bolos-caseiros": "caseiros", "04-tortas": "tortas",
    "05-copos": "copos", "06-doces": "doces", "07-pascoa": "pascoa",
    "08-presentes": "presentes", "09-salgados": "salgados",
    "10-loja-e-equipe": "loja",
}

# Fora do --novas. São fotos da marca (retrato da Mary, fachada, arte, vídeo)
# que vão para lugares específicos do site, não para a galeria de produtos.
PASTA_INSTITUCIONAL = "10-loja-e-equipe"


def cobrir(im, alvo, ax=0.5, ay=0.42):
    """Redimensiona preenchendo o alvo e corta o excedente.
    ay menor mostra mais do topo — preserva os toppers dos bolos."""
    tw, th = alvo
    w, h = im.size
    s = max(tw / w, th / h)
    nw, nh = max(tw, round(w * s)), max(th, round(h * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    x, y = int((nw - tw) * ax), int((nh - th) * ay)
    return im.crop((x, y, x + tw, y + th))


def caber(im, limite):
    mw, mh = limite
    w, h = im.size
    s = min(mw / w, mh / h, 1.0)
    return im.resize((round(w * s), round(h * s)), Image.LANCZOS) if s < 1 else im


def processar(foto, saida):
    caminho = os.path.join(ORIGEM, foto["arquivo"].replace("/", os.sep))
    if not os.path.exists(caminho):
        return f'  FALTA  {foto["arquivo"]}'
    im = Image.open(caminho).convert("RGB")
    if foto.get("recorte"):
        im = im.crop(tuple(foto["recorte"]))
    ax, ay = foto.get("enquadramento") or [0.5, 0.42]

    cobrir(im, CARD, ax, ay).save(
        os.path.join(saida, foto["slug"] + "-card.webp"), "WEBP", quality=84, method=6)

    grande = caber(im, GRANDE)
    if max(im.size) < 1000:      # origem pequena: devolve definição
        grande = grande.filter(ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=3))
    grande.save(os.path.join(saida, foto["slug"] + ".webp"), "WEBP", quality=87, method=6)
    return f'  ok     {foto["slug"]:26s} {im.size[0]}x{im.size[1]}'


def slugificar(nome):
    base = os.path.splitext(nome)[0]
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode()
    base = base.lower().replace(" ", "-").replace("_", "-")
    return "".join(c for c in base if c.isalnum() or c == "-").strip("-")


def html_da_foto(foto, pasta):
    """Snippet pronto para colar na galeria do index.html."""
    cat = CATEGORIA.get(pasta, "festa")
    s, t, a = foto["slug"], foto["titulo"] or foto["slug"], foto["alt"] or "TODO: descrever a foto"
    return (f'      <button class="shot" data-lightbox="galeria" data-cat="{cat}"\n'
            f'              data-full="assets/img/produtos/{s}.webp" data-caption="{t}">\n'
            f'        <img src="assets/img/produtos/{s}-card.webp" alt="{a}"\n'
            f'             width="800" height="1000" loading="lazy" decoding="async">\n'
            f'      </button>')


def mascote():
    """Gera a Mary que aponta para o botão do WhatsApp.

    Salve o PNG recortado (fundo transparente) em:
        fotos-origem/10-loja-e-equipe/mary-mascote.png
    e rode:  python ferramentas/build-fotos.py --mascote
    """
    entrada = None
    for ext in (".png", ".webp"):
        p = os.path.join(ORIGEM, "10-loja-e-equipe", "mary-mascote" + ext)
        if os.path.exists(p):
            entrada = p
            break
    if not entrada:
        print("Não achei fotos-origem/10-loja-e-equipe/mary-mascote.png")
        print("Salve o PNG com fundo transparente nesse caminho e rode de novo.")
        return

    im = Image.open(entrada)
    if im.mode != "RGBA":
        print(f"AVISO: a imagem está em {im.mode}, não RGBA — sem transparência,")
        print("       ela vai aparecer como um retângulo sobre o site.")
        im = im.convert("RGBA")

    alfa = im.getchannel("A")
    if alfa.getextrema()[0] > 250:
        print("AVISO: o canal alfa está todo opaco. O fundo não foi removido.")

    im = im.crop(im.getbbox() or (0, 0, *im.size))   # corta a moldura vazia
    im.thumbnail((420, 560), Image.LANCZOS)          # 2x do tamanho exibido
    destino = os.path.join(RAIZ, "assets", "img", "mary-mascote.webp")
    im.save(destino, "WEBP", quality=88, method=6)
    kb = os.path.getsize(destino) / 1024
    print(f"ok  mary-mascote.webp  {im.size[0]}x{im.size[1]}  {kb:.1f} KB")
    print(f'    Ajuste no index.html: width="{im.size[0]}" height="{im.size[1]}"')


def main():
    if "--mascote" in sys.argv[1:]:
        mascote()
        return
    dados = json.load(open(MANIFESTO, encoding="utf-8"))
    saida = os.path.join(RAIZ, dados["saida"].replace("/", os.sep))
    os.makedirs(saida, exist_ok=True)
    args = sys.argv[1:]

    if "--novas" in args:
        conhecidos = {f["arquivo"] for f in dados["fotos"]}
        novas = []
        for pasta in sorted(CATEGORIA):
            dir_ = os.path.join(ORIGEM, pasta)
            if not os.path.isdir(dir_) or pasta == PASTA_INSTITUCIONAL:
                continue
            for nome in sorted(os.listdir(dir_)):
                rel = f"{pasta}/{nome}"
                # "_" no começo = material de apoio (cardápio, arte), não é produto
                if (rel in conhecidos or nome.startswith("_")
                        or not nome.lower().endswith(EXTENSOES)):
                    continue
                novas.append({"arquivo": rel, "slug": slugificar(nome), "recorte": None,
                              "enquadramento": [0.5, 0.42], "titulo": "", "alt": "",
                              "_pasta": pasta})
        if not novas:
            print("Nenhuma foto nova encontrada.")
            return
        print(f"{len(novas)} foto(s) nova(s):\n")
        for f in novas:
            print(processar(f, saida))
        print("\n" + "=" * 68)
        print("COLE ISTO NA GALERIA DO index.html (e escreva titulo/alt):")
        print("=" * 68)
        for f in novas:
            print(html_da_foto(f, f.pop("_pasta")))
        dados["fotos"].extend(novas)
        json.dump(dados, open(MANIFESTO, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=2)
        print(f"\n{len(novas)} registro(s) adicionado(s) ao manifesto.")
        return

    alvo = None
    if "--slug" in args:
        alvo = args[args.index("--slug") + 1]

    fotos = [f for f in dados["fotos"] if not alvo or f["slug"] == alvo]
    if not fotos:
        print(f"Slug '{alvo}' não está no manifesto.")
        return
    print(f"Processando {len(fotos)} foto(s)...")
    for f in fotos:
        print(processar(f, saida))
    print("Pronto.")


if __name__ == "__main__":
    main()

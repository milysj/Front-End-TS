(function() {
    if (typeof document !== 'undefined') {
        // Injeta os links da fonte Google Jaro
        var link1 = document.createElement('link');
        link1.rel = 'preconnect';
        link1.href = 'https://fonts.googleapis.com';
        document.head.appendChild(link1);

        var link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://fonts.gstatic.com';
        link2.crossOrigin = 'anonymous';
        document.head.appendChild(link2);

        var link3 = document.createElement('link');
        link3.rel = 'stylesheet';
        link3.href = 'https://fonts.googleapis.com/css2?family=Jaro&display=swap';
        document.head.appendChild(link3);

        // Injeta estilos CSS para forçar redimensionamento em tela cheia com aspect ratio
        var style = document.createElement('style');
        style.innerHTML = `
            html, body {
                margin: 0px !important;
                padding: 0px !important;
                border: 0px !important;
                overflow: hidden !important;
                width: 100% !important;
                height: 100% !important;
                background-color: #000000 !important;
            }
            canvas, #canvas {
                width: 100% !important;
                height: 100% !important;
                object-fit: contain !important;
            }
        `;
        document.head.appendChild(style);
    }
})();

function obter_dados_fase_js() {
    if (parent && parent.gameData) {
        return JSON.stringify(parent.gameData);
    }
    return "";
}

function jogar_voltar_js() {
    if (parent) {
        // Se houver histórico anterior no Next.js, volta; caso contrário, redireciona para a home
        if (parent.history.length > 1) {
            parent.history.back();
        } else {
            parent.location.href = "/";
        }
    }
}
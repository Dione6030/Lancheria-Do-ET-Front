/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema escuro
        "escuro-fundo": "#090611",
        "escuro-superficie": "#151024",
        "escuro-primaria": "#8B3DFF",
        "escuro-magenta": "#FF3CAC",
        "escuro-ciano": "#20E3FF",
        "escuro-promocao": "#C6FF00",
        "escuro-texto": "#F7F2FF",
        "escuro-texto-secundario": "#B9ACC9",
        "escuro-erro": "#FF4D6D",
        

        // Tema claro
        "claro-fundo": "#F7F5FF",
        "claro-superficie": "#FFFFFF",
        "claro-primaria": "#6D28D9",
        "claro-magenta": "#D61F8D",
        "claro-ciano": "#007CBA",
        "claro-promocao": "#5D8500",
        "claro-texto": "#20152E",
        "claro-texto-secundario": "#665B72",
        "claro-erro": "#D6284B",
        
},
    },
  },
  plugins: [],
}


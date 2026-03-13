export interface Publication {
    emoji: string;
    event: string;
    title: string;
    description: string;
    area: string;
    url: string;
}

export const publications: Publication[] = [
    {
        emoji: "📄",
        event: "XXVII Enc. Nacional de Modelagem Computacional",
        title: "Redução de dimensionalidade de um teste de adição à internet",
        description:
            "Aplicação de algoritmo genético para identificar as questões de maior peso em um teste de adição à internet, reduzindo a dimensionalidade do instrumento sem perda de precisão diagnóstica.",
        area: "Algoritmos Genéticos · Otimização",
        url: "/ENMC-apresentation.pdf",
    },
    {
        emoji: "📄",
        event: "2º Congresso de Educação e Inovação",
        title: "Avaliação de técnicas de IA na classificação de indivíduos diabéticos",
        description:
            "Comparação de técnicas de aprendizado de máquina para classificação binária de indivíduos diabéticos e não diabéticos, avaliando performance dos modelos para apoio à triagem clínica.",
        area: "Machine Learning · Saúde",
        url: "/2-uni-congress-apresentation.pdf",
    },
    {
        emoji: "🤝",
        event: "Colaboração Voluntária · UNIMONTES",
        title: "TV Boxes apreendidas como microcomputadores",
        description:
            "Colaboração em projeto de pesquisa para transformar TV boxes apreendidas ilegalmente em microcomputadores funcionais, promovendo reaproveitamento tecnológico e inclusão digital.",
        area: "Hardware · Inclusão Digital",
        url: "/tv-boxs-project.pdf",
    },
];

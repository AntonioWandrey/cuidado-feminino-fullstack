package Cuidado.Feminino.API.infrastructure.seeder;

import Cuidado.Feminino.API.domain.entity.*;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import Cuidado.Feminino.API.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CategoriaConteudoRepository categoriaRepository;
    private final ConteudoEducativoRepository conteudoRepository;
    private final SerieConteudoRepository serieRepository;
    private final SerieConteudoItemRepository serieItemRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoriaRepository.count() > 0) {
            log.info("DataSeeder: dados já existem, pulando seed.");
            return;
        }

        log.info("DataSeeder: iniciando população de dados para ambiente dev...");

        CategoriaConteudo catQueixas  = salvarCategoria("Queixas Ginecológicas", "Sintomas e queixas ginecológicas comuns e como reconhecê-los", "stethoscope", 1);
        CategoriaConteudo catCiclo    = salvarCategoria("Ciclo Menstrual", "Entenda as fases do seu ciclo e o que é normal", "calendar", 2);
        CategoriaConteudo catPrevencao = salvarCategoria("Prevenção e Rastreio", "Exames e vacinas para proteger sua saúde", "shield", 3);
        CategoriaConteudo catBemEstar = salvarCategoria("Bem-estar e Autocuidado", "Hábitos e práticas para uma vida mais saudável", "heart", 4);
        CategoriaConteudo catDireitos = salvarCategoria("Direitos e Apoio", "Seus direitos, canais de denúncia e rede de apoio", "hand", 5);
        CategoriaConteudo catFertilidade = salvarCategoria("Fertilidade", "Informações sobre ciclo fértil, concepção e planejamento reprodutivo", "baby", 6);

        SerieConteudo serieTentando = salvarSerie(
                "Tentando Engravidar",
                "Série com informações baseadas em evidências para quem está planejando uma gravidez"
        );

        salvarConteudo(catQueixas, "Corrimento Vaginal",
                "O que é normal, quando se preocupar e como cuidar",
                """
                O corrimento vaginal é a produção de secreção pela vagina e é completamente normal em mulheres em idade fértil. A mucosa vaginal saudável produz secreções que variam em quantidade e consistência ao longo do ciclo menstrual. O corrimento transparente ou esbranquiçado, sem odor forte, sem coceira e sem ardor é considerado fisiológico — ou seja, normal e saudável.

                Quando o corrimento muda de cor (amarelado, esverdeado, acinzentado, com aspecto de leite talhado), apresenta odor desagradável, é acompanhado de coceira intensa, ardor ao urinar ou dor pélvica, pode ser sinal de infecção. As causas mais comuns incluem candidíase vulvovaginal (fungo), vaginose bacteriana e tricomoníase. Cada uma tem tratamento específico e deve ser diagnosticada por um profissional de saúde.

                Para cuidar da saúde íntima em casa: use sabonete neutro apenas na parte externa, evite duchas vaginais (que desequilibram a flora vaginal), prefira roupas íntimas de algodão, troque regularmente o absorvente durante a menstruação e mantenha a região seca. Se perceber mudança no corrimento, anote as características e procure a Unidade Básica de Saúde.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "corrimento,vaginal,leucorreia,infecção,candidíase,vaginose,tricomoníase,saúde,ginecologia,UBS",
                4, false, PerfilAlvo.TODAS,
                "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/candidose");

        salvarConteudo(catQueixas, "Cólica Menstrual",
                "Causas, cuidados em casa e quando buscar avaliação médica",
                """
                A cólica menstrual, chamada de dismenorreia, é uma das queixas ginecológicas mais comuns. Ela ocorre porque o útero se contrai para expelir o endométrio durante a menstruação. Essas contrações são causadas por substâncias chamadas prostaglandinas, que são produzidas em maior quantidade nas mulheres que sentem cólicas mais intensas.

                A dor geralmente começa um ou dois dias antes da menstruação, com pico no primeiro ou segundo dia, e melhora à medida que o fluxo vai diminuindo. A cólica pode ser sentida no baixo ventre, irradiando para as costas e coxas. Algumas mulheres também relatam náusea, dor de cabeça e diarreia. Isso é chamado de dismenorreia primária — quando não há doença causando a cólica.

                Medidas que podem ajudar em casa: compressa quente no abdômen (reduz as contrações uterinas), analgésicos como ibuprofeno ou paracetamol conforme a bula, prática regular de exercício físico (libera endorfinas) e dieta pobre em sal e açúcar nos dias anteriores. Se a cólica for muito intensa, não melhorar com analgésicos comuns, piorar com o tempo ou surgir junto com sangramento anormal, procure a UBS — pode ser sinal de endometriose.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "cólica,menstrual,dismenorreia,dor,menstruação,período,analgésico,endometriose",
                3, false, PerfilAlvo.TODAS,
                "https://bvsms.saude.gov.br/bvs/publicacoes/protocolos_atencao_basica_saude_mulheres.pdf");

        salvarConteudo(catQueixas, "Atraso Menstrual",
                "Quando fazer o teste, o que pode causar e quando procurar a UBS",
                """
                O ciclo menstrual pode variar entre 21 e 36 dias e ainda ser considerado normal. O atraso menstrual é contado a partir do dia esperado para a menstruação, conforme o padrão habitual da mulher. Um atraso de até 7 dias em um ciclo regular pode ocorrer por estresse, variações climáticas, mudanças na rotina, exercício excessivo ou leve variação hormonal.

                A gravidez é a causa mais comum de atraso prolongado em mulheres sexualmente ativas. O teste de farmácia detecta o hormônio hCG na urina e pode ser feito a partir do primeiro dia de atraso. O resultado positivo deve ser confirmado em consulta na UBS. Outras causas incluem síndrome dos ovários policísticos (SOP), distúrbios tireoidianos, perda ou ganho de peso rápido e uso de anticoncepcionais.

                Procure a UBS se: o atraso for superior a 7 dias sem causa aparente, o teste de gravidez for positivo, você apresentar outros sintomas como dor pélvica ou sangramento atípico, ou se os atrasos forem recorrentes. Anote as datas dos seus ciclos — esse registro ajuda muito o profissional de saúde a entender o seu padrão hormonal.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "atraso,menstrual,ciclo,menstruação,gravidez,teste,UBS,SOP,hormônios",
                3, false, PerfilAlvo.TODAS,
                "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/sindrome-dos-ovarios-policisticos");

        salvarConteudo(catQueixas, "Sangramento Fora do Período",
                "Como registrar, sinais de alerta e quando buscar ajuda",
                """
                O sangramento que ocorre fora do período menstrual esperado é chamado de sangramento intermenstrual ou spotting. Pode se manifestar como manchas marrons ou avermelhadas na roupa íntima fora do período habitual. Em algumas situações é benigno — por exemplo, no período de adaptação a anticoncepcionais hormonais ou próximo à ovulação.

                No entanto, o sangramento fora do período pode ser sinal de alerta para: ectopia cervical, pólipos uterinos, miomas, infecções sexualmente transmissíveis, distúrbios de coagulação e, em casos menos comuns, lesões no colo do útero. Por isso, nunca ignore um sangramento atípico, especialmente se for recorrente ou acompanhado de dor.

                Para facilitar a avaliação médica, anote no seu diário: a data em que o sangramento ocorreu, a quantidade (manchas, absorvente molhado?), a cor (vermelho vivo, marrom, rosado), a duração e se houve dor associada. Essas informações são fundamentais para o ginecologista identificar a causa. Se o sangramento for intenso, com dor forte ou febre, procure atendimento de urgência.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "sangramento,spotting,fora,período,menstrual,alerta,ginecológico,pólipo,mioma",
                3, false, PerfilAlvo.TODAS,
                "https://www.gov.br/saude/pt-br/composicao/saes/dahu/atencao-a-saude-da-mulher");

        salvarConteudo(catQueixas, "Dor ou Ardor ao Urinar",
                "Sintomas associados à cistite e quando buscar ajuda",
                """
                A dor ou ardor ao urinar, chamada de disúria, é sintoma frequente nas mulheres devido à anatomia do trato urinário feminino. A uretra feminina é mais curta e próxima à vagina e ao ânus, o que facilita a entrada de bactérias. A causa mais comum é a infecção do trato urinário (ITU), especialmente a cistite, causada frequentemente pela bactéria Escherichia coli.

                Os sintomas típicos de cistite incluem: ardor ou queimação ao urinar, vontade frequente e urgente de urinar (mas sai pouca urina), sensação de bexiga cheia mesmo após urinar, urina turva ou com odor forte e, às vezes, sangue na urina. A cistite não tratada pode evoluir para pielonefrite (infecção dos rins), com febre alta, calafrios e dor lombar.

                Enquanto aguarda atendimento na UBS: aumente a ingestão de água, evite segurar a urina por muito tempo, urine sempre após relações sexuais e higienize a região íntima sempre de frente para trás. Não se automedique com antibióticos sem prescrição médica — o uso inadequado contribui para a resistência bacteriana. A UBS pode coletar urina para exame e prescever o tratamento correto.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "dor,ardor,urinar,cistite,infecção,urinária,ITU,bactéria,UBS",
                3, false, PerfilAlvo.TODAS,
                "https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/i/infeccao-urinaria");

        salvarConteudo(catCiclo, "Conheça Seu Ciclo Menstrual",
                "Fases do ciclo, o que é normal e como registrar",
                """
                O ciclo menstrual é o período entre o primeiro dia de uma menstruação e o primeiro dia da próxima. A duração normal varia de 21 a 36 dias — não precisa ser exatamente 28 dias como se popularizou. Cada mulher tem seu próprio padrão e ele pode variar ao longo da vida, especialmente na adolescência, após gestações e próximo à menopausa.

                O ciclo divide-se em quatro fases: a fase menstrual (sangramento, dias 1 a 5 em média), a fase folicular (crescimento dos folículos ovarianos, até a ovulação), a ovulação (liberação do óvulo, geralmente no meio do ciclo) e a fase lútea (após a ovulação até o início da próxima menstruação, com duração média de 14 dias). Cada fase é regida por hormônios — estrogênio e progesterona — que afetam o humor, a energia, a pele e o apetite.

                Registrar o ciclo é um poderoso ato de autoconhecimento. Anote: o dia em que a menstruação começa e termina, a intensidade do fluxo, os sintomas associados (cólica, humor, corrimento, energia). Com esses dados, você e o seu médico terão um panorama muito mais completo da sua saúde hormonal. Ciclos muito irregulares, menstruação ausente por mais de 3 meses (amenorreia) ou ciclos fora do padrão 21-36 dias merecem investigação médica.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "ciclo,menstrual,fases,folicular,ovulação,lútea,menstruação,saúde,hormônios,registro",
                5, true, PerfilAlvo.TODAS,
                "https://bvsms.saude.gov.br/bvs/publicacoes/protocolos_atencao_basica_saude_mulheres.pdf");

        salvarConteudo(catCiclo, "TPM e Alterações Emocionais",
                "Causas hormonais, sintomas e estratégias de bem-estar",
                """
                A Tensão Pré-Menstrual (TPM) é um conjunto de sintomas físicos e emocionais que surgem nos dias que antecedem a menstruação, geralmente na fase lútea (segunda metade do ciclo). Estima-se que até 80% das mulheres em idade reprodutiva experimentam algum grau de TPM. Os sintomas mais comuns incluem irritabilidade, choro fácil, ansiedade, sensação de inchaço, sensibilidade nas mamas, dor de cabeça e alterações no apetite.

                A causa da TPM está relacionada às flutuações hormonais — especialmente a queda dos níveis de estrogênio e progesterona no final do ciclo. Esses hormônios influenciam neurotransmissores como a serotonina, que regula o humor e o bem-estar. Quando os sintomas são muito intensos e interferem significativamente no trabalho, nos relacionamentos e nas atividades do dia a dia, pode ser um quadro mais sério chamado Transtorno Disfórico Pré-Menstrual (TDPM), que merece avaliação médica especializada.

                Estratégias que podem ajudar: praticar exercícios físicos regularmente (aumentam a serotonina), reduzir o consumo de sal, cafeína, álcool e açúcar nos dias anteriores à menstruação, priorizar o sono e técnicas de relaxamento como meditação e respiração profunda. Registrar os sintomas ao longo do ciclo ajuda a identificar o padrão e a comunicar melhor ao profissional de saúde na próxima consulta.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "TPM,tensão,pré-menstrual,humor,emoções,hormônios,ciclo,bem-estar,serotonina,TDPM",
                4, false, PerfilAlvo.TODAS,
                "https://bvsms.saude.gov.br/bvs/publicacoes/protocolos_atencao_basica_saude_mulheres.pdf");

        salvarConteudo(catPrevencao, "Câncer de Colo do Útero",
                "Papanicolau, HPV, vacinação e sinais de alerta",
                """
                O câncer do colo do útero é o terceiro tipo mais frequente entre as mulheres no Brasil, mas é altamente prevenível. Em quase todos os casos, é causado pelo Papilomavírus Humano (HPV), uma infecção sexualmente transmissível muito comum. A maioria das pessoas elimina o vírus naturalmente, mas em alguns casos ele persiste e pode causar lesões que, sem tratamento, evoluem para câncer ao longo de anos.

                A principal forma de prevenção é o exame de Papanicolau (colpocitologia oncótica), que detecta lesões precursoras antes de se tornarem câncer. O Ministério da Saúde recomenda que mulheres entre 25 e 64 anos façam o exame a cada 3 anos (após dois exames consecutivos negativos com intervalo de 1 ano). A vacina contra o HPV é oferecida gratuitamente pelo SUS para meninas e meninos de 9 a 14 anos. O preservativo reduz o risco de transmissão do HPV.

                Sinais de alerta que devem levar à UBS imediatamente: sangramento vaginal fora do período menstrual ou após relações sexuais, corrimento com odor forte e aspecto alterado, dor pélvica persistente. Em estágio inicial, o câncer de colo do útero frequentemente não causa sintomas — por isso o rastreamento regular é tão importante. Não adie seu Papanicolau: ele salva vidas.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "câncer,colo,útero,HPV,Papanicolau,prevenção,rastreio,vacina,SUS,INCA",
                5, false, PerfilAlvo.TODAS,
                "https://www.inca.gov.br/tipos-de-cancer/cancer-do-colo-do-utero | https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/cancer-de-colo-de-utero");

        salvarConteudo(catPrevencao, "Câncer de Mama",
                "Autoexame, mamografia e sinais de alerta",
                """
                O câncer de mama é o tipo de câncer mais comum entre as mulheres no Brasil. Quando detectado precocemente, as chances de cura são muito altas — acima de 95% nos estágios iniciais. O câncer de mama pode afetar mulheres de qualquer idade, mas é mais comum após os 50 anos. Fatores de risco incluem histórico familiar, menarca precoce, menopausa tardia, obesidade e uso prolongado de terapia hormonal.

                O autoexame das mamas não substitui os exames de rastreamento, mas ajuda a conhecer o próprio corpo e perceber mudanças. Observe as mamas mensalmente, após a menstruação, quando os seios estão menos sensíveis. Procure a UBS se notar: nódulo ou espessamento na mama ou axila, mudança no tamanho ou formato da mama, alteração na pele (vermelhidão, aspecto de casca de laranja), saída espontânea de secreção pelo mamilo (especialmente sanguinolenta) ou retração do mamilo. O Ministério da Saúde recomenda mamografia bienal para mulheres entre 50 e 69 anos.

                Para reduzir o risco: mantenha peso saudável, pratique atividade física regularmente, evite bebidas alcoólicas, amamente seus filhos se possível e faça os exames preventivos recomendados. Não espere sintomas para cuidar da sua saúde — o rastreamento regular é a melhor proteção contra o câncer de mama.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "câncer,mama,autoexame,mamografia,prevenção,rastreio,INCA,nódulo,SUS",
                5, false, PerfilAlvo.TODAS,
                "https://www.inca.gov.br/tipos-de-cancer/cancer-de-mama | https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/cancer-de-mama");

        salvarConteudo(catDireitos, "Violência Contra a Mulher",
                "Violentômetro, canais de denúncia e rede de apoio",
                """
                A violência contra a mulher é qualquer ação ou omissão que cause morte, lesão, sofrimento físico, sexual, psicológico, dano moral ou patrimonial — seja no âmbito doméstico, familiar ou nas relações íntimas. A Lei Maria da Penha (Lei 11.340/2006) é um marco no combate à violência doméstica e familiar no Brasil, criando mecanismos para proteger as mulheres e punir os agressores.

                O Violentômetro é uma escala visual que ajuda a identificar comportamentos violentos desde os mais sutis até os mais graves. Começa com atitudes como ignorar, xingar, humilhar e isolar, passa por ameaças, controle e empurrões, e chega à agressão física, estupro e feminicídio. Muitas mulheres não reconhecem os sinais iniciais de violência, o que atrasa a busca por ajuda. Violência psicológica e moral também são formas de violência e também são crime.

                Se você está em situação de violência ou conhece alguém que está, procure ajuda. Os principais canais são: Ligue 180 (Central de Atendimento à Mulher, funciona 24h, gratuito e sigiloso), 190 (Polícia Militar — emergências), Delegacia da Mulher (DEAM), CRAS e CREAS do seu município e Casa da Mulher Brasileira. Você não precisa enfrentar isso sozinha — existe uma rede de apoio e proteção.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "violência,mulher,denúncia,180,CRAS,Lei,Maria,Penha,violentômetro,direitos,feminicídio",
                4, false, PerfilAlvo.TODAS,
                "https://www.gov.br/mdh/pt-br/navegue-por-temas/politicas-para-mulheres/ligue-180 | https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11340.htm");

        salvarConteudo(catBemEstar, "Climatério e Menopausa",
                "Sintomas, fogachos e dicas práticas para essa fase da vida",
                """
                O climatério é a fase de transição entre o período reprodutivo e o não-reprodutivo da mulher, marcada pelo declínio gradual da função ovariana. A menopausa é o momento específico — diagnosticado após 12 meses consecutivos sem menstruação — que geralmente ocorre entre 45 e 55 anos no Brasil. Antes da menopausa, os ciclos menstruais tornam-se irregulares: podem ficar mais curtos, mais longos, mais ou menos intensos.

                Os sintomas mais comuns do climatério incluem os fogachos (ondas de calor súbitas acompanhadas de suor), secura vaginal (que pode causar desconforto nas relações sexuais), insônia, mudanças de humor, dificuldade de concentração, ganho de peso e diminuição da libido. A intensidade varia muito de mulher para mulher — enquanto algumas passam por essa fase com sintomas leves, outras enfrentam impacto significativo na qualidade de vida.

                Estratégias que podem ajudar: praticar atividade física regularmente (ameniza fogachos e melhora o humor), manter alimentação equilibrada rica em cálcio e vitamina D (importante para prevenir osteoporose), usar roupas leves e em camadas, evitar bebidas quentes, álcool e cigarro (que pioram os fogachos). Para sintomas intensos, o ginecologista pode indicar terapia de reposição hormonal (TRH) ou outras opções. O acompanhamento médico regular é fundamental nessa fase.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "climatério,menopausa,fogacho,hormônios,sintomas,bem-estar,mulher,osteoporose,TRH",
                5, false, PerfilAlvo.MENOPAUSA,
                "https://bvsms.saude.gov.br/bvs/publicacoes/protocolos_atencao_basica_saude_mulheres.pdf");

        salvarConteudo(catBemEstar, "Autocuidado e Hábitos Saudáveis",
                "Rotina, exercício, sono e exames preventivos em dia",
                """
                Autocuidado em saúde é o conjunto de práticas e atitudes que você adota para preservar e promover seu bem-estar físico, emocional e mental. Não é egoísmo — é necessidade. Mulheres frequentemente colocam as necessidades dos outros à frente das suas, mas cuidar de si mesma é fundamental para cuidar bem de quem ama. Pequenas mudanças na rotina diária podem ter grande impacto na qualidade de vida.

                No aspecto físico, priorize: sono de qualidade (7 a 9 horas por noite), atividade física regular (pelo menos 150 minutos de atividade moderada por semana), alimentação equilibrada com frutas, verduras, legumes e proteínas, hidratação adequada (cerca de 2 litros de água por dia) e exames preventivos em dia. Para a saúde mental, reserve momentos de lazer e descanso, cuide dos seus relacionamentos, pratique gratidão e não hesite em buscar apoio psicológico quando necessário.

                No cuidado específico da saúde feminina: mantenha seus exames ginecológicos atualizados (Papanicolau, ultrassom pélvico conforme indicação), acompanhe seu ciclo menstrual, conheça seu corpo e perceba quando algo muda. O autocuidado também inclui reconhecer seus limites, pedir ajuda e saber dizer não. Cuide-se — você merece uma vida saudável e plena.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "autocuidado,saúde,rotina,exercício,sono,bem-estar,hábitos,saudável,prevenção",
                4, true, PerfilAlvo.TODAS,
                "https://www.gov.br/saude/pt-br/composicao/saes/dahu/atencao-a-saude-da-mulher");

        ConteudoEducativo periodoFertil = salvarConteudo(catFertilidade, "Período Fértil sem Neura",
                "Entendendo seu ciclo na prática para quem quer engravidar",
                """
                O período fértil é a janela do ciclo menstrual em que a gravidez pode ocorrer. A ovulação é o momento em que um óvulo maduro é liberado pelo ovário. O óvulo sobrevive por apenas 12 a 24 horas após a ovulação, mas os espermatozoides podem viver por até 5 dias no trato reprodutivo feminino — por isso, a janela fértil se estende por cerca de 6 dias: os 5 dias antes da ovulação e o dia da ovulação.

                Em um ciclo regular de 28 dias, a ovulação ocorre geralmente ao redor do 14º dia. Em ciclos mais longos ou curtos, esse cálculo muda — a ovulação costuma acontecer 14 dias antes do início da próxima menstruação. Para identificar com mais precisão sua janela fértil: observe o muco cervical (torna-se transparente, elástico, semelhante à clara de ovo no período fértil), registre a temperatura basal (sobe ligeiramente após a ovulação) ou use testes de LH disponíveis em farmácias.

                Para quem está tentando engravidar, o momento ideal para relações sexuais é durante os 3 a 5 dias anteriores à ovulação prevista e no dia da ovulação. O ácido fólico deve ser iniciado pelo menos 3 meses antes de tentar engravidar para reduzir o risco de defeitos do tubo neural. Ciclos irregulares tornam a previsão mais difícil — nesse caso, a consulta com ginecologista ou especialista em reprodução humana é especialmente importante.

                ⚠️ Essas informações não substituem avaliação médica. Procure sempre a UBS para confirmação e acompanhamento.
                """,
                "período,fértil,ovulação,gravidez,concepção,ciclo,tentante,fertilidade,ácido,fólico,LH",
                5, false, PerfilAlvo.TENTANTE,
                "https://bvsms.saude.gov.br/bvs/publicacoes/protocolos_atencao_basica_saude_mulheres.pdf | https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/p/planejamento-reprodutivo");

        serieItemRepository.save(SerieConteudoItem.builder()
                .serie(serieTentando)
                .conteudo(periodoFertil)
                .ordem(1)
                .build());

        log.info("DataSeeder: seed concluído — 6 categorias, 1 série, 13 conteúdos criados.");
    }

    private CategoriaConteudo salvarCategoria(String nome, String descricao, String icone, int ordem) {
        return categoriaRepository.save(CategoriaConteudo.builder()
                .nome(nome)
                .descricao(descricao)
                .icone(icone)
                .ordem(ordem)
                .ativo(true)
                .build());
    }

    private SerieConteudo salvarSerie(String nome, String descricao) {
        return serieRepository.save(SerieConteudo.builder()
                .nome(nome)
                .descricao(descricao)
                .ordem(1)
                .ativo(true)
                .build());
    }

    private ConteudoEducativo salvarConteudo(CategoriaConteudo categoria, String titulo, String subtitulo,
                                              String corpo, String palavrasChave, int tempoLeitura,
                                              boolean destaque, PerfilAlvo perfil, String fonte) {
        return conteudoRepository.save(ConteudoEducativo.builder()
                .categoria(categoria)
                .titulo(titulo)
                .subtitulo(subtitulo)
                .corpo(corpo.strip())
                .palavrasChave(palavrasChave)
                .tempoLeituraMin(tempoLeitura)
                .destaque(destaque)
                .perfilAlvo(perfil)
                .ativo(true)
                .fonteReferencia(fonte)
                .build());
    }
}

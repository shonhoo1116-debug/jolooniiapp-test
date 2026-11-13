'use strict';
/* Фото (Gemini/ChatGPT) зураг + кодоор нэмсэн сум, үсэг. Сум, үсгийн координатыг зургийн пикселээр (w x h) хэмжиж тавьсан —
   AI зураг дээр шугам, үсэг зурахгүй, зөвхөн энд код нэмнэ (алдаа гарахгүй). marks: {l: үсэг, x1, x2, y}. */
const TEST_PHOTO = {
  /* ChatGPT-ийн зургууд (source-rules/tests/ch01/photo-v2). labels — {l: үсэг, x, y} зургийн пикселээр. */
  /* Q01: сум, үсэг ChatGPT зураг дээр бэлэн байгаа тул нэмэлт хийхгүй. Нөөц: q01_blender.jpg, q01_gemini.jpg */
  q01: { src: 'img/tests/q01_bg.webp', w: 1921, h: 819 , labels: [{ l: 'Д', x: 852, y: 185, fs: 62 }, { l: 'Г', x: 1052, y: 297, fs: 62 }, { l: 'В', x: 955, y: 424, fs: 62 }, { l: 'Б', x: 1292, y: 559, fs: 62 }, { l: 'А', x: 1161, y: 746, fs: 62 }] },
  q03: { src: 'img/tests/q03.webp', w: 1774, h: 887, labels: [{ l: 'А', x: 810, y: 80 }, { l: 'Б', x: 1700, y: 80 }] },
  q04: { src: 'img/tests/q04.webp', w: 2038, h: 771 },
  q05: { src: 'img/tests/q05.webp', w: 1672, h: 941, labels: [{ l: 'А', x: 480, y: 95 }, { l: 'Б', x: 800, y: 80 }, { l: 'В', x: 1400, y: 95 }] },
  q06: { src: 'img/tests/q06.webp', w: 2048, h: 768, labels: [{ l: 'А', x: 560, y: 70 }, { l: 'Б', x: 1560, y: 70 }] },
  q11: { src: 'img/tests/q11.webp', w: 1672, h: 941, labels: [{ l: 'А', x: 880, y: 248 }, { l: 'Б', x: 430, y: 148 }, { l: 'В', x: 1180, y: 125 }] },
  /* Q15: гүйцэж түрүүлж буй машин (А: цэнхэр, Б: шар) — ЗҮҮН дохио анивчина (урд, хойд зүүн булан). Зургийн пиксел. */
  q15: { src: 'img/tests/q15.webp', w: 1672, h: 941, labels: [{ l: 'А', x: 60, y: 90 }, { l: 'Б', x: 905, y: 90 }],
    lamps: [
      { el: [544.5, 553, 2.8, 4.6, -30], glow: 13 },
      { poly: [[655, 655], [660, 651.8], [666.3, 652], [673.8, 656.3], [678.8, 661.3], [682, 667.5], [682.5, 677.5], [676.3, 678.8], [668.8, 677], [661.3, 673], [656.3, 665], [655, 658.8]], glow: 22 },
      { el: [1400, 537.2, 3.8, 3, -10], glow: 13 },
      { poly: [[1530, 635.4], [1534.2, 633.3], [1540, 633.3], [1547.5, 636.7], [1553.3, 640.4], [1556.7, 645.8], [1557.9, 652.5], [1558.3, 658.8], [1555.8, 659.6], [1547.5, 659.2], [1540, 657.1], [1535.8, 652.5], [1531.7, 645], [1530, 639.2]], glow: 22 }] },
  /* Q16, Q18: хуучин зургийн дагуу гүйцэж буй / орж буй машины ЗҮҮН (жолоочийн зүүн) дохио анивчина. q16.jpg дээрх бэлэн гэрлийг арилгасан (асаах нь код). */
  q16: { src: 'img/tests/q16.webp', w: 1567, h: 940, lamps: [
    { el: [1352, 495, 4, 5, -20], glow: 16 },
    { el: [1565, 563, 3, 11, 0], glow: 12 }] },
  q18: { src: 'img/tests/q18.webp', w: 1672, h: 941, lamps: [
    { el: [1086, 302, 4, 6, -20], glow: 14 },
    { poly: [[1286, 358], [1300, 352], [1316, 355], [1330, 360], [1333, 368], [1325, 372], [1312, 376], [1298, 377], [1288, 370]], glow: 18 }] },
  q19: { src: 'img/tests/q19.webp', w: 1672, h: 941 },
  /* 2-р бүлэг (ChatGPT зураг): шугам, үсэг шаардлагагүй. */
  c2q13: { src: 'img/tests/c2q13.webp', w: 1898, h: 829 },
  c2q16: { src: 'img/tests/c2q16.webp', w: 1923, h: 817 },
  c2q18: { src: 'img/tests/c2q18.webp', w: 1890, h: 832 },
  /* 3-р бүлэг (ChatGPT зураг). c3q06: А = зүүн шил арчуур, Б = баруун (жолоочийн талын) шил арчуур. */
  c3q03: { src: 'img/tests/c3q03.webp', w: 1903, h: 826 },
  c3q06: { src: 'img/tests/c3q06.webp', w: 1881, h: 836, labels: [{ l: 'А', x: 430, y: 440 }, { l: 'Б', x: 930, y: 445 }] },
  c3q08: { src: 'img/tests/c3q08.webp', w: 1883, h: 835 },
  c3q10: { src: 'img/tests/c3q10.webp', w: 1905, h: 825 },
  c3q11: { src: 'img/tests/c3q11.webp', w: 1899, h: 828 },
  c3q12: { src: 'img/tests/c3q12.webp', w: 1866, h: 843 },
  c3q13: { src: 'img/tests/c3q13.webp', w: 1888, h: 833, lamps: [
      { el: [612,300,22,12,0], glow: 22, dim: true },
      { el: [748,298,20,12,0], glow: 22, dim: true },
      { el: [419,285,4,9,0], glow: 10, dim: true },
      { el: [563,283,6,11,0], glow: 12, dim: true }] },
  c3q14: { src: 'img/tests/c3q14.webp', w: 1899, h: 828, lamps: [
      { el: [868,162,10,4,0], glow: 12, dim: true },
      { el: [993,162,9,4,0], glow: 12, dim: true }] },
  c3q21: { src: 'img/tests/c3q21.webp', w: 1875, h: 839, lamps: [
      { el: [412,271,9,15,0], glow: 18, dim: true },
      { el: [1145,416,13,9,0], glow: 22, dim: true },
      { el: [1645,268,7,16,0], glow: 16, dim: true }] },
  c3q25: { src: 'img/tests/c3q25.webp', w: 1886, h: 834 },
  c3q27: { src: 'img/tests/c3q27.webp', w: 1875, h: 839 },
  c3q28: { src: 'img/tests/c3q28.webp', w: 1870, h: 841 },
  c3q29: { src: 'img/tests/c3q29.webp', w: 1870, h: 841, lamps: [
      { el: [1690,660,7,14,0], glow: 16, dim: true }] },
  c3q30: { src: 'img/tests/c3q30.webp', w: 1873, h: 840, lamps: [
      { el: [1110,398,8,14,-20], glow: 20, dim: true },
      { el: [1603,632,22,30,0], glow: 24, dim: true }] },
  /* 4-р бүлэг (ChatGPT зураг). c4q06/07/08 — эх аппад дууны тэмдэг (♪) байсан (файлын нэрэнд n). */
  c4q01: { src: 'img/tests/c4q01.webp', w: 1862, h: 845, beams: [
      { rect: [724,397,746,409], col: '#ff2a1a', alt: 0, glow: 16 },
      { rect: [692,396,721,406], col: '#2a62ff', alt: 1, glow: 16 },
      { rect: [832,398,891,412], col: '#2a62ff', alt: 1, glow: 22 }] },
  c4q02: { src: 'img/tests/c4q02.webp', w: 1886, h: 834, beams: [
      { rect: [897,207,968,223], col: '#35ff7a', alt: 0, glow: 24 },
      { rect: [1019,206,1075,222], col: '#35ff7a', alt: 1, glow: 22 }] },
  c4q05: { src: 'img/tests/c4q05.webp', w: 1899, h: 828, beams: [
      { rect: [1416,183,1433,195], col: '#ff9a1a', alt: 0, glow: 16 }] },
  c4q06: { src: 'img/tests/c4q06.webp', w: 1895, h: 830, sound: { x: 605, y: 290, burst: true, R: 170, fs: 58, span: 160 }, beams: [
      { rect: [547,289,587,304], col: '#ff2a1a', alt: 0, glow: 18 },
      { rect: [484,288,545,303], col: '#2a62ff', alt: 1, glow: 18 },
      { rect: [636,291,722,307], col: '#2a62ff', alt: 1, glow: 26 }] },
  c4q07: { src: 'img/tests/c4q07.webp', w: 1891, h: 832, sound: { x: 1030, y: 190, burst: true, R: 125, fs: 44, span: 160 }, beams: [
      { poly: [[987,186],[1014,192],[1014,198],[987,196]], col: '#ff2a1a', alt: 0, glow: 14 },
      { poly: [[1036,196],[1062,200],[1062,207],[1036,205]], col: '#ff2a1a', alt: 0, glow: 14 },
      { rect: [1063,197,1079,206], col: '#2a62ff', alt: 1, glow: 14 }] },
  c4q08: { src: 'img/tests/c4q08_bg.webp', w: 1905, h: 825, sound: { x: 1170, y: 238, burst: true, R: 125, fs: 44, span: 160 }, labels: [{ l: 'А', x: 1052, y: 99, fs: 62 }, { l: 'Б', x: 582, y: 755, fs: 62 }], beams: [
      { rect: [1131,235,1157,247], col: '#ff2a1a', alt: 0, glow: 16 },
      { rect: [1180,247,1204,257], col: '#2a62ff', alt: 1, glow: 18 },
      { rect: [1206,242,1228,253], col: '#2a62ff', alt: 1, glow: 18 },
      { poly: [[706,82],[742,84],[768,90],[766,97],[740,95],[708,92]], col: '#ffa81a', alt: 0, glow: 18 }] },
  c4q09: { src: 'img/tests/c4q09.webp', w: 1893, h: 831, beams: [
      { rect: [155,461,172,468], col: '#ff2a1a', alt: 0, glow: 10 },
      { rect: [183,461,201,468], col: '#2a62ff', alt: 1, glow: 10 },
      { rect: [220,461,236,468], col: '#2a62ff', alt: 1, glow: 10 }] },
  c4q10: { src: 'img/tests/c4q10.webp', w: 1885, h: 834, beams: [
      { rect: [1300,164,1355,175], col: '#ff2a1a', alt: 0, glow: 16 },
      { rect: [1392,166,1431,174], col: '#2a62ff', alt: 1, glow: 18 }],
    lamps: [
      { el: [1004,267,7,8,0], glow: 14 },
      { el: [1082,266,6,9,0], glow: 14 },
      { el: [908,262,3,8,0], glow: 10 }] },
  /* 5-р бүлэг (Замын тэмдэг): ChatGPT-ийн зургууд — сум, үсэг зураг дотроо бэлэн. */
  c5q04: { src: 'img/tests/c5q04.webp', w: 1903, h: 826 },
  c5q09: { src: 'img/tests/c5q09.webp', w: 1890, h: 832 },
  c5q10: { src: 'img/tests/c5q10.webp', w: 1919, h: 820 },
  c5q11: { src: 'img/tests/c5q11.webp', w: 1915, h: 821 },
  c5q12: { src: 'img/tests/c5q12.webp', w: 1891, h: 832, lamps: [
      { el: [613,558,8,31,8], glow: 25, soft: true }] },
  c5q14: { src: 'img/tests/c5q14.webp', w: 1956, h: 804 },
  c5q15: { src: 'img/tests/c5q15.webp', w: 1918, h: 820 },
  c5q16: { src: 'img/tests/c5q16.webp', w: 1918, h: 820 },
  c5q17: { src: 'img/tests/c5q17.webp', w: 1915, h: 821 },
  c5q18: { src: 'img/tests/c5q18.webp', w: 1930, h: 815 },
  c5q23: { src: 'img/tests/c5q23_bg.webp', w: 1918, h: 820 , labels: [{ l: 'В', x: 454, y: 500, fs: 62 }, { l: 'А', x: 992, y: 242, fs: 62 }, { l: 'Б', x: 382, y: 331, fs: 62 }] },
  c5q26: { src: 'img/tests/c5q26.webp', w: 1914, h: 823, lamps: [
      { el: [771,418,7,8,0], glow: 9, soft: true, dim: true },
      { el: [852,432,7,8,0], glow: 9, soft: true, dim: true },
      { el: [1095,482,6,11,0], glow: 9, soft: true, dim: true },
      { el: [287,652,7,11,0], glow: 9, soft: true, dim: true },
      { el: [390,678,8,16,0], glow: 13, soft: true, dim: true },
      { el: [942,641,6,5,0], glow: 9, soft: true, dim: true }] },
  c5q27: { src: 'img/tests/c5q27.webp', w: 1824, h: 803 },
  c5q28: { src: 'img/tests/c5q28.webp', w: 1942, h: 809 },
  c5q29: { src: 'img/tests/c5q29.webp', w: 1922, h: 818 },
  c5q30: { src: 'img/tests/c5q30.webp', w: 1914, h: 822 },
  c5q31: { src: 'img/tests/c5q31.webp', w: 1923, h: 817 },
  c5q32: { src: 'img/tests/c5q32.webp', w: 1896, h: 830, lamps: [
      { el: [1409,620,22,20,-15], glow: 18, soft: true }] },
  c5q33: { src: 'img/tests/c5q33.webp', w: 1914, h: 822, lamps: [
      { el: [1041,553,28,16,0], glow: 22, soft: true }] },
  c5q36: { src: 'img/tests/c5q36.webp', w: 1921, h: 819 },
  c5q37: { src: 'img/tests/c5q37.webp', w: 1918, h: 820 },
  c5q38: { src: 'img/tests/c5q38.webp', w: 1905, h: 825 },
  c5q39: { src: 'img/tests/c5q39.webp', w: 1933, h: 813 },
  c5q40: { src: 'img/tests/c5q40.webp', w: 1918, h: 820 },
  c5q42: { src: 'img/tests/c5q42.webp', w: 1923, h: 818 },
  c5q43: { src: 'img/tests/c5q43.webp', w: 1918, h: 820 },
  c5q44: { src: 'img/tests/c5q44.webp', w: 1915, h: 821, lamps: [
      { el: [987,392,6,10,-10], glow: 10, soft: true },
      { el: [1265,427,17,7,15], glow: 14, soft: true }] },
  c5q46: { src: 'img/tests/c5q46.webp', w: 1899, h: 828 },
  c5q47: { src: 'img/tests/c5q47.webp', w: 1897, h: 829, lamps: [
      { el: [78,653,11,12,0], glow: 10, soft: true }] },
  c5q48: { src: 'img/tests/c5q48.webp', w: 1931, h: 814 },
  c5q49: { src: 'img/tests/c5q49.webp', w: 1909, h: 824 },
  c5q50: { src: 'img/tests/c5q50.webp', w: 1942, h: 810 },
  c5q51: { src: 'img/tests/c5q51.webp', w: 1909, h: 824 },
  c5q52: { src: 'img/tests/c5q52.webp', w: 1908, h: 824 },
  c5q53: { src: 'img/tests/c5q53.webp', w: 1933, h: 814 },
  c5q54: { src: 'img/tests/c5q54.webp', w: 1919, h: 820 },
  c5q55: { src: 'img/tests/c5q55.webp', w: 1933, h: 813 },
  c5q56: { src: 'img/tests/c5q56.webp', w: 1915, h: 821, lamps: [
      { el: [726,172,9,5,0], glow: 9, soft: true },
      { el: [1608,604,9,7,0], glow: 9, soft: true }] },
  c5q57: { src: 'img/tests/c5q57.webp', w: 1918, h: 820 },
  c5q58: { src: 'img/tests/c5q58.webp', w: 1905, h: 825 },
  c5q59: { src: 'img/tests/c5q59.webp', w: 1915, h: 821 },
  c5q60: { src: 'img/tests/c5q60.webp', w: 1918, h: 820, lamps: [
      { el: [184,545,13,6,-8], glow: 12, soft: true },
      { el: [444,439,4,7,0], glow: 8, soft: true }] },
  c5q61: { src: 'img/tests/c5q61.webp', w: 1930, h: 815, labels: [{ l: 'А', x: 1515, y: 350, plain: 1 }, { l: 'Б', x: 995, y: 228, plain: 1 }, { l: 'В', x: 430, y: 318, plain: 1 }, { l: 'Г', x: 470, y: 545, plain: 1 }] },
  c5q62: { src: 'img/tests/c5q62.webp', w: 1923, h: 818 },
  c5q63: { src: 'img/tests/c5q63.webp', w: 1921, h: 819 },
  c5q64: { src: 'img/tests/c5q64.webp', w: 1918, h: 820, labels: [{ l: 'А', x: 1540, y: 362, plain: 1 }, { l: 'Б', x: 1027, y: 244, plain: 1 }, { l: 'В', x: 476, y: 340, plain: 1 }, { l: 'Г', x: 474, y: 566, plain: 1 }] },
  c5q65: { src: 'img/tests/c5q65.webp', w: 1918, h: 820, lamps: [
      { el: [1776,677,19,9,-35], glow: 12, soft: true }] },
  c5q66: { src: 'img/tests/c5q66.webp', w: 1916, h: 821 },
  c5q67: { src: 'img/tests/c5q67.webp', w: 1915, h: 821 },
  c5q68: { src: 'img/tests/c5q68.webp', w: 1915, h: 821 },
  c5q69: { src: 'img/tests/c5q69.webp', w: 1916, h: 821 },
  c5q70: { src: 'img/tests/c5q70.webp', w: 1915, h: 821 },
  c5q71: { src: 'img/tests/c5q71.webp', w: 1916, h: 821 },
  c5q72: { src: 'img/tests/c5q72.webp', w: 1918, h: 820 },
  c5q73: { src: 'img/tests/c5q73.webp', w: 1950, h: 807, lamps: [
      { el: [1350,622,18,12,0], glow: 14, soft: true }] },
  c5q74: { src: 'img/tests/c5q74.webp', w: 1918, h: 820, lamps: [
      { el: [1435,646,21,10,3], glow: 12, soft: true },
      { el: [1236,541,4,6,0], glow: 8, soft: true }] },
  c5q77: { src: 'img/tests/c5q77.webp', w: 1918, h: 820 },
  c5q78: { src: 'img/tests/c5q78.webp', w: 1915, h: 821, lamps: [
      { el: [1424,683,11,8,0], glow: 9, soft: true }] },
  c5q79: { src: 'img/tests/c5q79.webp', w: 1922, h: 818 },
  c5q83: { src: 'img/tests/c5q83.webp', w: 1918, h: 820 },
  c5q84: { src: 'img/tests/c5q84.webp', w: 1916, h: 821 },
  c5q86: { src: 'img/tests/c5q86.webp', w: 1931, h: 814 },
  c5q88: { src: 'img/tests/c5q88.webp', w: 1933, h: 814, lamps: [
      { el: [372,633,7,13,0], glow: 10, soft: true }] },
  c5q89: { src: 'img/tests/c5q89.webp', w: 1915, h: 821 },
  c5q90: { src: 'img/tests/c5q90.webp', w: 1909, h: 824, lamps: [
      { el: [172,544,20,7,0], glow: 16, soft: true },
      { el: [433,443,11,5,15], glow: 10, soft: true }] },
  c5q91: { src: 'img/tests/c5q91.webp', w: 1919, h: 820 },
  c5q92: { src: 'img/tests/c5q92.webp', w: 1921, h: 819, lamps: [
      { el: [219,611,5,11,-12], glow: 10, soft: true },
      { el: [1318,230,7,6,0], glow: 9, soft: true }] },
  c5q93: { src: 'img/tests/c5q93.webp', w: 1915, h: 821 },
  c5q94: { src: 'img/tests/c5q94.webp', w: 1909, h: 824, lamps: [
      { el: [1300,619,25,8,0], glow: 20, soft: true }] },
  c5q95: { src: 'img/tests/c5q95.webp', w: 1919, h: 820, lamps: [
      { el: [1360,649,20,8,0], glow: 16, soft: true },
      { el: [1086,542,4,9,0], glow: 8, soft: true }] },
  c5q96: { src: 'img/tests/c5q96.webp', w: 1927, h: 816 },
  c5q97: { src: 'img/tests/c5q97.webp', w: 1918, h: 820 },
  c5q99: { src: 'img/tests/c5q99.webp', w: 1918, h: 820 },
  c5q100: { src: 'img/tests/c5q100.webp', w: 1918, h: 820 },
  c5q104: { src: 'img/tests/c5q104.webp', w: 1923, h: 818 },
  c5q105: { src: 'img/tests/c5q105.webp', w: 1918, h: 820 },
  c5q107: { src: 'img/tests/c5q107.webp', w: 1918, h: 820 },
  c5q109: { src: 'img/tests/c5q109.webp', w: 1940, h: 811 },
  /* Бүлэг 6 (ChatGPT, 2026-10-30). */
  c6q01: { src: 'img/tests/c6q01.webp', w: 1918, h: 820 },
  c6q02: { src: 'img/tests/c6q02.webp', w: 1918, h: 820 },
  c6q03: { src: 'img/tests/c6q03.webp', w: 1918, h: 820, lamps: [{ el: [331,612,8,17,5], glow: 20, soft: true, dim: true }] },
  c6q04: { src: 'img/tests/c6q04.webp', w: 1918, h: 820, lamps: [{ el: [436,533,20,9,8], glow: 24, soft: true }] },
  c6q05: { src: 'img/tests/c6q05.webp', w: 1918, h: 820, lamps: [{ el: [1748,698,26,10,8], glow: 24, soft: true }, { el: [1433,581,5,9,0], glow: 9, soft: true }] },
  c6q06: { src: 'img/tests/c6q06.webp', w: 1918, h: 820 },
  c6q07: { src: 'img/tests/c6q07.webp', w: 1905, h: 825, lamps: [{ el: [380,543,30,9,-8], glow: 28, soft: true }, { el: [707,450,5,10,0], glow: 9, soft: true }] },
  c6q08: { src: 'img/tests/c6q08.webp', w: 1920, h: 819, lamps: [{ el: [1645,458,20,12,12], glow: 22, soft: true }, { el: [1379,347,4,6,0], glow: 8, soft: true }] },
  c6q09: { src: 'img/tests/c6q09_bg.webp', w: 1933, h: 813, ask: true, arrows: [{ pts: [[1207,341],[1180,369],[1152,397]], w: 3 }], labels: [{ l: '?', x: 1218, y: 368, fs: 62 }] },
  c6q10: { src: 'img/tests/c6q10.webp', w: 1918, h: 788, ask: true, arrows: [{ pts: [[1172,255],[1145,275],[1118,298]], w: 3 }], labels: [{ l: '?', x: 1190, y: 240, fs: 62 }] },
  c6q11: { src: 'img/tests/c6q11.webp', w: 1909, h: 824 },
  c6q12: { src: 'img/tests/c6q12.webp', w: 1915, h: 821, lamps: [{ el: [50,667,8,12,0], glow: 16, soft: true }, { el: [1741,445,19,9,0], glow: 20, soft: true, dim: true }, { el: [1392,352,4,8,0], glow: 8, soft: true }] },
  c6q13: { src: 'img/tests/c6q13.webp', w: 1918, h: 820, lamps: [{ el: [1667,632,12,16,0], glow: 22, soft: true }, { el: [1289,516,4,9,0], glow: 8, soft: true }] },
  c6q14: { src: 'img/tests/c6q14.webp', w: 1925, h: 817, lamps: [{ el: [1659,632,10,18,0], glow: 20, soft: true }, { el: [1258,478,4,9,0], glow: 8, soft: true }] },
  c6q15: { src: 'img/tests/c6q15.webp', w: 1911, h: 823 },
  c6q16: { src: 'img/tests/c6q16.webp', w: 1922, h: 818 },
  c6q17: { src: 'img/tests/c6q17.webp', w: 1914, h: 822, arrows: [{ pts: [[905,528],[935,468],[985,425],[1030,390]], w: 8 }] },
  c6q18: { src: 'img/tests/c6q18.webp', w: 1915, h: 821 },
  c6q19: { src: 'img/tests/c6q19.webp', w: 1913, h: 822, ask: true, arrows: [{ pts: [[905,352],[945,368],[982,386]], w: 3 }], labels: [{ l: '?', x: 885, y: 345, fs: 62 }] },
  c6q20: { src: 'img/tests/c6q20.webp', w: 1834, h: 750, tapered: [{ x: 1085, tip: 299, base: 309, bottom: 508, hw: 20, w0: 20, w1: 2.5 }] },
  c6q21: { src: 'img/tests/c6q21.webp', w: 1916, h: 821 },
  c6q22: { src: 'img/tests/c6q22.webp', w: 1916, h: 821 },
  c6q23: { src: 'img/tests/c6q23.webp', w: 1916, h: 821, ask: true, arrows: [{ pts: [[1040,372],[1022,392],[1004,408]], w: 3 }], labels: [{ l: '?', x: 1058, y: 362, fs: 62 }] },
  c6q24: { src: 'img/tests/c6q24.webp', w: 1916, h: 821, arrows: [{ pts: [[302,166],[305,306]], w: 7 }, { pts: [[308,170],[782,308]], w: 7 }, { pts: [[314,164],[1390,320]], w: 7 }], labels: [{ l: '?', x: 300, y: 152, fs: 66 }, { l: '1', x: 330, y: 650 }, { l: '2', x: 960, y: 650 }, { l: '3', x: 1590, y: 650 }] },
  c6q25: { src: 'img/tests/c6q25.webp', w: 1757, h: 624 },
  c6q26: { src: 'img/tests/c6q26.webp', w: 1916, h: 821, lamps: [{ el: [1248,428,20,9,8], glow: 24, soft: true }, { el: [1489,352,4,10,0], glow: 9, soft: true }] },
  c6q27: { src: 'img/tests/c6q27.webp', w: 1916, h: 821 },
  c6q28: { src: 'img/tests/c6q28.webp', w: 1764, h: 738, lamps: [{ el: [1336,383,6,9,0], glow: 13, soft: true, dim: true }] },
  c6q29: { src: 'img/tests/c6q29_bg.webp', w: 1916, h: 821, ask: true, arrows: [{ pts: [[735,330],[788,384],[842,439]], w: 3 }], labels: [{ l: '?', x: 708, y: 328, fs: 62 }] },
  c6q30: { src: 'img/tests/c6q30_bg.webp', w: 1916, h: 821, ask: true, arrows: [{ pts: [[677,284],[698,316],[719,347]], w: 3 }], labels: [{ l: '?', x: 661, y: 288, fs: 62 }] },
  c6q31: { src: 'img/tests/c6q31_bg.webp', w: 1919, h: 820, ask: true, arrows: [{ pts: [[841,576],[939,506],[1037,437]], w: 3 }], labels: [{ l: '?', x: 823, y: 566, fs: 62 }] },
  c6q32: { src: 'img/tests/c6q32.webp', w: 1916, h: 821, lamps: [{ el: [604,150,12,7,-20], glow: 18, soft: true }] },
  c6q33: { src: 'img/tests/c6q33.webp', w: 1916, h: 821 },
  c6q34: { src: 'img/tests/c6q34_bg.webp', w: 1915, h: 821, ask: true, arrows: [{ pts: [[781,335],[806,363],[832,391]], w: 3 }], labels: [{ l: '?', x: 763, y: 342, fs: 62 }] },
  c6q35: { src: 'img/tests/c6q35.webp', w: 1749, h: 760 },
  c6q37: { src: 'img/tests/c6q37_bg.webp', w: 1915, h: 821, ask: true, arrows: [{ pts: [[1449,197],[1449,238],[1449,280]], w: 3 }], labels: [{ l: '?', x: 1449, y: 188, fs: 62 }] },
  c6q38: { src: 'img/tests/c6q38.webp', w: 1816, h: 754, ask: true, arrows: [{ pts: [[1175,150],[1150,120],[1130,95]], w: 3 }], labels: [{ l: '?', x: 1196, y: 158, fs: 62 }] },
  c6q39: { src: 'img/tests/c6q39_bg.webp', w: 1915, h: 821 , labels: [{ l: 'А', x: 1006, y: 86, fs: 62 }, { l: 'Б', x: 1428, y: 107, fs: 62 }] },
  c6q40: { src: 'img/tests/c6q40.webp', w: 1915, h: 821, ask: true, arrows: [{ pts: [[968,325],[1000,292],[1032,262]], w: 3 }], labels: [{ l: '?', x: 950, y: 352, fs: 62 }] },
  /* Бүлэг 7 (ChatGPT, 2026-10-30). Сум, үсэг зураг дотроо бэлэн. */
c7q03: { src: 'img/tests/c7q03.webp', w: 1694, h: 821 },
  c7q04: { src: 'img/tests/c7q04.webp', w: 1916, h: 821, lamps: [{ el: [933,189,12,7,0], glow: 20, soft: true }] },
  c7q05: { src: 'img/tests/c7q05.webp', w: 1918, h: 820, lamps: [{ el: [966,184,6,10,0], glow: 13, soft: true }] },
  c7q06: { src: 'img/tests/c7q06.webp', w: 1915, h: 821 },
  c7q07: { src: 'img/tests/c7q07.webp', w: 1916, h: 821, labels: [{ l: 'А', x: 90, y: 100 }, { l: 'Б', x: 1050, y: 100 }] },
  c7q08: { src: 'img/tests/c7q08.webp', w: 1918, h: 820 },
  c7q09: { src: 'img/tests/c7q09.webp', w: 1918, h: 820 },
  c7q10: { src: 'img/tests/c7q10.webp', w: 1918, h: 820 },
  c7q11: { src: 'img/tests/c7q11.webp', w: 1918, h: 820 },
  c7q12: { src: 'img/tests/c7q12.webp', w: 1918, h: 820 },
  c7q13: { src: 'img/tests/c7q13.webp', w: 1918, h: 820 },
  c7q14: { src: 'img/tests/c7q14.webp', w: 1918, h: 820 },
  c7q15: { src: 'img/tests/c7q15.webp', w: 1918, h: 820 },
  c7q16: { src: 'img/tests/c7q16.webp', w: 1919, h: 820 },
  c7q17: { src: 'img/tests/c7q17.webp', w: 1076, h: 464, lamps: [{ el: [446,257,6,14,0], glow: 12, soft: true }] },
  c7q18: { src: 'img/tests/c7q18.webp', w: 1910, h: 823, lamps: [{ el: [645,571,6,13,0], glow: 14, soft: true }] },
  c7q19: { src: 'img/tests/c7q19.webp', w: 1903, h: 826, lamps: [{ el: [426,662,6,14,0], glow: 14, soft: true }] },
  c7q20: { src: 'img/tests/c7q20.webp', w: 1919, h: 820 },
  c7q21: { src: 'img/tests/c7q21.webp', w: 1926, h: 817 },
  c7q22: { src: 'img/tests/c7q22.webp', w: 1914, h: 822 },
  c7q23: { src: 'img/tests/c7q23.webp', w: 1912, h: 823 },
  c7q24: { src: 'img/tests/c7q24.webp', w: 1913, h: 822 },
  c7q25: { src: 'img/tests/c7q25.webp', w: 1918, h: 820 },
  c7q26: { src: 'img/tests/c7q26.webp', w: 1915, h: 821 },
  c7q27: { src: 'img/tests/c7q27.webp', w: 1923, h: 818 },
  c7q28: { src: 'img/tests/c7q28.webp', w: 1928, h: 816, lamps: [{ el: [1317,151,16,8,-20], glow: 20, soft: true }, { el: [1520,66,5,10,0], glow: 10, soft: true }, { el: [1849,602,6,15,0], glow: 14, soft: true }, { el: [162,676,18,9,8], glow: 18, soft: true }, { el: [526,572,7,9,0], glow: 14, soft: true }] },
  c7q29: { src: 'img/tests/c7q29.webp', w: 1909, h: 824, lamps: [{ el: [1320,92,8,14,0], glow: 16, soft: true }, { el: [110,510,5,14,0], glow: 14, soft: true }] },
  c7q30: { src: 'img/tests/c7q30.webp', w: 1561, h: 672, lamps: [{ el: [646,535,5,11,-25], glow: 13, soft: true }] },
  c7q31: { src: 'img/tests/c7q31.webp', w: 1557, h: 672 },
  c7q32: { src: 'img/tests/c7q32.webp', w: 1588, h: 672 },
  c7q33: { src: 'img/tests/c7q33.webp', w: 1551, h: 672 },
  c7q34: { src: 'img/tests/c7q34.webp', w: 1568, h: 672 },
  c7q35: { src: 'img/tests/c7q35.webp', w: 1539, h: 672 },
  c7q36: { src: 'img/tests/c7q36.webp', w: 1571, h: 672 },
  c7q37: { src: 'img/tests/c7q37.webp', w: 1592, h: 672 },
  c7q38: { src: 'img/tests/c7q38.webp', w: 1585, h: 656 },
  /* Бүлэг 8 (Gemini/ChatGPT, 2026-10-30). */
c8q03: { src: 'img/tests/c8q03.webp', w: 1551, h: 672 },
  c8q04: { src: 'img/tests/c8q04.webp', w: 1551, h: 672 },
  c8q07: { src: 'img/tests/c8q07.webp', w: 1551, h: 672 },
  c8q08: { src: 'img/tests/c8q08.webp', w: 1024, h: 442, lamps: [{ el: [488,207,8,5,0], glow: 12, soft: true }, { el: [598,207,8,5,0], glow: 12, soft: true }] },
  c8q10: { src: 'img/tests/c8q10.webp', w: 1564, h: 672 },
  c8q11: { src: 'img/tests/c8q11.webp', w: 1551, h: 672 },
  c8q12: { src: 'img/tests/c8q12.webp', w: 1538, h: 672 },
  c8q13: { src: 'img/tests/c8q13.webp', w: 1568, h: 688, lamps: [{ el: [1350,102,6,8,0], glow: 13, soft: true }, { el: [1482,93,6,5,0], glow: 11, soft: true }, { el: [1538,93,6,5,0], glow: 11, soft: true }] },
  c8q17: { src: 'img/tests/c8q17.webp', w: 1568, h: 672, lamps: [{ el: [434,357,6,10,0], glow: 13, soft: true }, { el: [606,367,8,11,0], glow: 14, soft: true }, { el: [802,262,4,10,0], glow: 10, soft: true }] },
  c8q18: { src: 'img/tests/c8q18.webp', w: 1568, h: 688 },
  c8q20: { src: 'img/tests/c8q20.webp', w: 1544, h: 672, lamps: [{ el: [1261,518,7,6,0], glow: 14, soft: true }, { el: [1391,445,5,8,0], glow: 12, soft: true }, { el: [1312,493,9,7,0], glow: 15, soft: true }, { el: [760,373,6,9,0], glow: 13, soft: true }] },
  c8q21: { src: 'img/tests/c8q21.webp', w: 1564, h: 688, lamps: [{ el: [1179,151,5,8,0], glow: 11, soft: true }] },
  c8q23: { src: 'img/tests/c8q23.webp', w: 1568, h: 688, lamps: [{ el: [908,496,13,9,0], glow: 16, soft: true }, { el: [1050,325,5,6,0], glow: 10, soft: true }] },
  c8q24: { src: 'img/tests/c8q24.webp', w: 1909, h: 824 },
  c8q25: { src: 'img/tests/c8q25.webp', w: 1910, h: 823 },
  c8q26: { src: 'img/tests/c8q26.webp', w: 1557, h: 672, lamps: [{ el: [1003,286,8,8,0], glow: 14, soft: true }] },
  c8q27: { src: 'img/tests/c8q27.webp', w: 1928, h: 816 },
  c8q28: { src: 'img/tests/c8q28.webp', w: 1902, h: 827 },
  c8q29: { src: 'img/tests/c8q29.webp', w: 1910, h: 823, lamps: [{ el: [552,183,5,9,0], glow: 11, soft: true }, { el: [804,307,7,6,0], glow: 12, soft: true, dim: true }, { el: [915,263,5,10,0], glow: 11, soft: true, dim: true }] },
  c8q30: { src: 'img/tests/c8q30.webp', w: 1544, h: 672, lamps: [{ el: [1328,545,5,14,0], glow: 14, soft: true }] },
  c8q34: { src: 'img/tests/c8q34.webp', w: 1574, h: 672, lamps: [{ el: [1017,327,6,8,0], glow: 13, soft: true }, { el: [1346,305,5,10,0], glow: 12, soft: true }] },
  c8q35: { src: 'img/tests/c8q35.webp', w: 1568, h: 687 },
  c8q36: { src: 'img/tests/c8q36.webp', w: 1557, h: 672 },
  c8q37: { src: 'img/tests/c8q37.webp', w: 1544, h: 672 },
  c8q38: { src: 'img/tests/c8q38.webp', w: 1557, h: 672 },
  c8q39: { src: 'img/tests/c8q39.webp', w: 1564, h: 688 },
  c8q40: { src: 'img/tests/c8q40.webp', w: 1561, h: 672 },
  /* Бүлэг 9 (ChatGPT, 2026-10-31). */
  c11q04: { src: 'img/tests/c11q04.webp', w: 1564, h: 672 },
  c11q05: { src: 'img/tests/c11q05.webp', w: 1564, h: 672 },
  c11q08: { src: 'img/tests/c11q08.webp', w: 1564, h: 672 },
  c11q11: { src: 'img/tests/c11q11.webp', w: 1585, h: 672 },
  c11q12: { src: 'img/tests/c11q12.webp', w: 1574, h: 656 },
  c11q13: { src: 'img/tests/c11q13.webp', w: 1578, h: 672, lamps: [
      { el: [447,505,8,17,6], glow: 20, soft: true },
      { el: [328,470,4,10,0], glow: 14, soft: true },
      { el: [795,385,7,5,-20], glow: 14, soft: true },
      { el: [987,190,4,11,0], glow: 15, soft: true },
      { el: [1113,202,7,13,0], glow: 18, soft: true }] },
  c11q15: { src: 'img/tests/c11q15.webp', w: 1561, h: 672 },
  c11q18: { src: 'img/tests/c11q18.webp', w: 1568, h: 672 },
  c12q01: { src: 'img/tests/c12q01.webp', w: 1564, h: 672 },
  c12q02: { src: 'img/tests/c12q02.webp', w: 1571, h: 672 },
  c12q03: { src: 'img/tests/c12q03.webp', w: 1581, h: 672, lamps: [{ el: [684,270,9,8,0], glow: 16, soft: true }] },
  c12q04: { src: 'img/tests/c12q04.webp', w: 1581, h: 672, lamps: [{ el: [98,460,8,12,0], glow: 15, soft: true }] },
  c12q05: { src: 'img/tests/c12q05.webp', w: 1557, h: 672, lamps: [{ el: [76,455,8,13,0], glow: 15, soft: true }] },
  c12q06: { src: 'img/tests/c12q06.webp', w: 1588, h: 672, lamps: [{ el: [992,105,5,8,0], glow: 12, soft: true }] },
  c12q07: { src: 'img/tests/c12q07.webp', w: 1578, h: 672 },
  c12q08: { src: 'img/tests/c12q08.webp', w: 1592, h: 672 },
  c12q09: { src: 'img/tests/c12q09.webp', w: 1571, h: 672, lamps: [{ el: [877,296,9,15,0], glow: 18, soft: true }] },
  c12q10: { src: 'img/tests/c12q10.webp', w: 1599, h: 672 },
  c12q11: { src: 'img/tests/c12q11.webp', w: 1435, h: 580, lamps: [{ el: [308,480,6,22,0], glow: 20, soft: true }] },
  c12q12: { src: 'img/tests/c12q12.webp', w: 1599, h: 672 },
  c12q13: { src: 'img/tests/c12q13.webp', w: 1554, h: 672 },
  c12q14: { src: 'img/tests/c12q14.webp', w: 1583, h: 672, lamps: [{ el: [198,362,5,9,0], glow: 12, soft: true }, { el: [1262,515,6,9,0], glow: 13, soft: true }, { el: [1472,562,8,18,-8], glow: 18, soft: true }] },
  c12q15: { src: 'img/tests/c12q15.webp', w: 1564, h: 672, lamps: [{ el: [1165,507,7,8,0], glow: 13, soft: true }, { el: [1492,595,9,25,0], glow: 22, soft: true }] },
  c12q16: { src: 'img/tests/c12q16.webp', w: 1557, h: 672, lamps: [{ el: [1100,345,17,9,0], glow: 16, soft: true }] },
  c12q17: { src: 'img/tests/c12q17.webp', w: 1581, h: 672 },
  c12q18: { src: 'img/tests/c12q18.webp', w: 1557, h: 672 },
  c12q19: { src: 'img/tests/c12q19.webp', w: 1581, h: 656 },
  c12q20: { src: 'img/tests/c12q20.webp', w: 1544, h: 672 },
  c13q01: { src: 'img/tests/c13q01.webp', w: 1581, h: 672, lamps: [{ el: [1508,545,5,9,0], glow: 11, soft: true }] },
  c13q02: { src: 'img/tests/c13q02.webp', w: 1571, h: 656 },
  c13q03: { src: 'img/tests/c13q03.webp', w: 1599, h: 672 },
  c13q04: { src: 'img/tests/c13q04.webp', w: 1595, h: 672 },
  c13q05: { src: 'img/tests/c13q05.webp', w: 1574, h: 672 },
  c13q06: { src: 'img/tests/c13q06.webp', w: 1586, h: 672 },
  c13q07: { src: 'img/tests/c13q07.webp', w: 1600, h: 671 },
  c13q08: { src: 'img/tests/c13q08_bg.webp', w: 1600, h: 684 , labels: [{ l: 'Б', x: 938, y: 312, fs: 52 }, { l: 'А', x: 678, y: 311, fs: 52 }] },
  c13q09: { src: 'img/tests/c13q09.webp', w: 1599, h: 672 },
  c13q10: { src: 'img/tests/c13q10.webp', w: 1599, h: 672 },
  c13q11: { src: 'img/tests/c13q11.webp', w: 1557, h: 672 },
  c13q12: { src: 'img/tests/c13q12.webp', w: 1574, h: 672 },
  c13q13: { src: 'img/tests/c13q13.webp', w: 1581, h: 672 },
  c13q14: { src: 'img/tests/c13q14.webp', w: 1588, h: 672 },
  c13q15: { src: 'img/tests/c13q15.webp', w: 1568, h: 672 },
  c13q17: { src: 'img/tests/c13q17.webp', w: 1578, h: 672 },
  c13q18: { src: 'img/tests/c13q18.webp', w: 1581, h: 672 },
  c13q19: { src: 'img/tests/c13q19.webp', w: 1581, h: 672 },
  c13q20: { src: 'img/tests/c13q20.webp', w: 1585, h: 672 },
  c13q21: { src: 'img/tests/c13q21.webp', w: 1574, h: 656 },
  c13q22: { src: 'img/tests/c13q22.webp', w: 1588, h: 672 },
  c13q23: { src: 'img/tests/c13q23.webp', w: 1600, h: 661 },
  c13q24: { src: 'img/tests/c13q24.webp', w: 1310, h: 656 },
  c13q29: { src: 'img/tests/c13q29.webp', w: 1557, h: 672 },
  c13q31: { src: 'img/tests/c13q31.webp', w: 1588, h: 672 },
  c13q32: { src: 'img/tests/c13q32.webp', w: 1568, h: 672, lamps: [{ el: [541,292,8,6,0], glow: 12, soft: true }] },
  c13q33: { src: 'img/tests/c13q33.webp', w: 1441, h: 551 },
  c13q34: { src: 'img/tests/c13q34.webp', w: 1595, h: 672 },
  c13q35: { src: 'img/tests/c13q35.webp', w: 1578, h: 672 },
  c13q36: { src: 'img/tests/c13q36.webp', w: 1585, h: 672 },
  c13q37: { src: 'img/tests/c13q37.webp', w: 1592, h: 672 },
  c13q38: { src: 'img/tests/c13q38.webp', w: 1571, h: 656 },
  c13q39: { src: 'img/tests/c13q39.webp', w: 1557, h: 672 },
  c13q40: { src: 'img/tests/c13q40.webp', w: 1557, h: 672 },
  c13q42: { src: 'img/tests/c13q42.webp', w: 1600, h: 671 },
  c13q43: { src: 'img/tests/c13q43.webp', w: 1589, h: 656 },
  c13q44: { src: 'img/tests/c13q44.webp', w: 1592, h: 656 },
  c13q45: { src: 'img/tests/c13q45.webp', w: 1592, h: 672, lamps: [{ el: [352,418,13,30,0], glow: 26, soft: true }, { el: [618,407,5,5,0], glow: 10, soft: true }] },
  c13q46: { src: 'img/tests/c13q46.webp', w: 1599, h: 656 },
  c13q50: { src: 'img/tests/c13q50.webp', w: 1592, h: 672 },
  c13q51: { src: 'img/tests/c13q51.webp', w: 1568, h: 672 },
  c13q52: { src: 'img/tests/c13q52.webp', w: 1588, h: 672 },
  c13q53: { src: 'img/tests/c13q53.webp', w: 1564, h: 672 },
  c13q54: { src: 'img/tests/c13q54.webp', w: 1588, h: 672, lamps: [{ el: [302,478,8,7,0], glow: 13, soft: true }] },
  c13q55: { src: 'img/tests/c13q55.webp', w: 1551, h: 672 },
  c13q56: { src: 'img/tests/c13q56.webp', w: 1551, h: 672 },
  c13q57: { src: 'img/tests/c13q57.webp', w: 1592, h: 672 },
  c13q58: { src: 'img/tests/c13q58.webp', w: 1586, h: 672 },
  c13q59: { src: 'img/tests/c13q59.webp', w: 1600, h: 671 },
  c13q60: { src: 'img/tests/c13q60.webp', w: 1581, h: 672 },
  c13q61: { src: 'img/tests/c13q61.webp', w: 1585, h: 656 },
  c13q62: { src: 'img/tests/c13q62.webp', w: 1337, h: 543 },
  c13q64: { src: 'img/tests/c13q64.webp', w: 1585, h: 672 },
  c13q65: { src: 'img/tests/c13q65.webp', w: 1596, h: 656 },
  c13q66: { src: 'img/tests/c13q66.webp', w: 1592, h: 656, lamps: [{ el: [1378,589,3.4,9.5,-4], glow: 10, soft: true }] },
  c13q67: { src: 'img/tests/c13q67.webp', w: 1600, h: 650 },
  c13q68: { src: 'img/tests/c13q68.webp', w: 1599, h: 656 },
  c13q69: { src: 'img/tests/c13q69.webp', w: 1592, h: 656 },
  c13q70: { src: 'img/tests/c13q70.webp', w: 1581, h: 672, lamps: [{ el: [736,292,4.5,7.5,0], glow: 12, soft: true, dim: true }] },
  c13q71: { src: 'img/tests/c13q71.webp', w: 1564, h: 672 },
  c13q72: { src: 'img/tests/c13q72.webp', w: 1564, h: 672 },
  c13q73: { src: 'img/tests/c13q73.webp', w: 1578, h: 672 },
  c13q74: { src: 'img/tests/c13q74.webp', w: 1578, h: 656 },
  c13q75: { src: 'img/tests/c13q75.webp', w: 1564, h: 688 },
  c13q76: { src: 'img/tests/c13q76.webp', w: 1592, h: 672 },
  c13q77: { src: 'img/tests/c13q77.webp', w: 1561, h: 672 },
  c13q78: { src: 'img/tests/c13q78.webp', w: 1600, h: 694 },
  c13q79: { src: 'img/tests/c13q79.webp', w: 1600, h: 666 },
  c13q80: { src: 'img/tests/c13q80.webp', w: 1582, h: 672, lamps: [{ el: [610,375,3.8,8,0], glow: 11, soft: true }, { el: [682,371,4.2,3,0], glow: 8, soft: true }, { el: [1000,392,8,14,0], glow: 16, soft: true }] },
  c9q02: { src: 'img/tests/c9q02.webp', w: 1024, h: 451, lamps: [{ el: [387,115,4.6,5.6,-10], glow: 9, soft: true }] },
  c9q03: { src: 'img/tests/c9q03.webp', w: 1561, h: 672, lamps: [{ el: [1059,317,7.7,6.2,0], glow: 14, soft: true }, { el: [1429,309,7.7,6.2,0], glow: 14, soft: true }] },
  c9q04: { src: 'img/tests/c9q04.webp', w: 1557, h: 672, lamps: [{ el: [1002,174,8.4,6.7,0], glow: 15, soft: true }, { el: [1183,116,7.7,6.2,0], glow: 14, soft: true }] },
  c9q05: { src: 'img/tests/c9q05.webp', w: 1554, h: 672, lamps: [{ el: [1394,538,11.2,9,0], glow: 20, soft: true }] },
  c9q06: { src: 'img/tests/c9q06.webp', w: 1551, h: 672, lamps: [{ el: [938,501,11.2,9,0], glow: 20, soft: true }] },
  c9q07: { src: 'img/tests/c9q07.webp', w: 1595, h: 672, lamps: [{ el: [809,318,9.3,7.4,0], glow: 17, soft: true }, { el: [476,510,10.8,8.6,0], glow: 19, soft: true }, { el: [735,495,10.8,8.6,0], glow: 19, soft: true }] },
  c9q08: { src: 'img/tests/c9q08.webp', w: 1564, h: 672, lamps: [{ el: [988,217,7.4,6.2,0], glow: 14, soft: true }, { el: [1263,321,8.4,6.7,0], glow: 15, soft: true }, { el: [1069,518,9.9,7.9,0], glow: 18, soft: true }], labels: [{ l: 'А', x: 1102, y: 650, fs: 74, plain: true }, { l: 'Б', x: 1212, y: 530, fs: 74, plain: true }, { l: 'В', x: 1324, y: 419, fs: 74, plain: true }] },
  c9q09: { src: 'img/tests/c9q09.webp', w: 1599, h: 672, lamps: [{ el: [443,483,9.4,7.5,0], glow: 17, soft: true }, { el: [992,470,9.4,7.5,0], glow: 17, soft: true }, { el: [1246,484,9.4,7.5,0], glow: 17, soft: true }] },
  c9q10: { src: 'img/tests/c9q10.webp', w: 1568, h: 688, lamps: [{ el: [186,473,9.9,7.9,0], glow: 18, soft: true }, { el: [408,293,8.5,6.8,0], glow: 15, soft: true }, { el: [968,473,9.9,7.9,0], glow: 18, soft: true }, { el: [1189,293,8.5,6.8,0], glow: 15, soft: true }, { el: [1240,491,7.1,5.7,0], glow: 13, soft: true }] },
  c9q11: { src: 'img/tests/c9q11.webp', w: 1554, h: 672 },
  c9q12: { src: 'img/tests/c9q12.webp', w: 1564, h: 688, lamps: [{ el: [621,363,10,6.4,6], glow: 17, soft: true }] },
  c9q13: { src: 'img/tests/c9q13.webp', w: 1520, h: 688 },
  c9q14: { src: 'img/tests/c9q14.webp', w: 1523, h: 688, lamps: [{ el: [637,385,6.2,5,0], glow: 11, soft: true }, { el: [998,364,8.2,6.6,0], glow: 15, soft: true }] },
  c9q15: { src: 'img/tests/c9q15.webp', w: 1571, h: 672, lamps: [{ el: [1052,268,5.4,6.4,0], glow: 11, soft: true }, { el: [1168,313,5.4,5,0], glow: 11, soft: true }] },
  c9q16: { src: 'img/tests/c9q16.webp', w: 1571, h: 672 },
  c9q17: { src: 'img/tests/c9q17.webp', w: 1568, h: 672 },
  c9q18: { src: 'img/tests/c9q18.webp', w: 1592, h: 672 },
  c9q19: { src: 'img/tests/c9q19.webp', w: 1600, h: 671 },
  c9q20: { src: 'img/tests/c9q20.webp', w: 1923, h: 817, lamps: [{ el: [943,709,9,12,-8], glow: 20, soft: true }] },
  c9q21: { src: 'img/tests/c9q21.webp', w: 1581, h: 672, lamps: [{ el: [1200,102,5.7,4.6,0], glow: 10, soft: true }, { el: [1313,50,5.7,4.6,0], glow: 10, soft: true }] },
  c9q22: { src: 'img/tests/c9q22.webp', w: 1581, h: 672, lamps: [{ el: [653,143,7.1,5.7,0], glow: 13, soft: true }, { el: [987,277,7.8,6.2,0], glow: 14, soft: true }, { el: [1197,353,8.5,6.8,0], glow: 15, soft: true }] },
  c9q23: { src: 'img/tests/c9q23.webp', w: 1907, h: 825, lamps: [{ el: [1030,348,9.4,7.5,0], glow: 17, soft: true }] },
  c9q24: { src: 'img/tests/c9q24.webp', w: 1923, h: 818, lamps: [{ el: [260,452,11,8,-6], glow: 18, soft: true }, { el: [489,407,4.4,6.4,10], glow: 10, soft: true }] },
  c9q25: { src: 'img/tests/c9q25.webp', w: 1554, h: 672 },
  c9q26: { src: 'img/tests/c9q26.webp', w: 1914, h: 822, lamps: [{ el: [872,331,4.4,3.4,0], glow: 8, soft: true }] },
  c9q27: { src: 'img/tests/c9q27.webp', w: 1574, h: 672, lamps: [{ el: [741,152,6.2,3.8,0], glow: 9, soft: true }] },
  c9q28: { src: 'img/tests/c9q28.webp', w: 1805, h: 871, lamps: [{ el: [738,417,6.2,11,0], glow: 14, soft: true }] },
  c9q29: { src: 'img/tests/c9q29.webp', w: 1557, h: 672, lamps: [{ el: [752,258,7,3.8,0], glow: 10, soft: true }] },
  c9q30: { src: 'img/tests/c9q30.webp', w: 1571, h: 672, lamps: [{ el: [778,298,9.2,7.4,0], glow: 17, soft: true }, { el: [964,301,9.2,7.4,0], glow: 17, soft: true }] },
  c9q31: { src: 'img/tests/c9q31.webp', w: 1574, h: 672 },
  c9q32: { src: 'img/tests/c9q32.webp', w: 1581, h: 672 },
  c9q33: { src: 'img/tests/c9q33.webp', w: 1561, h: 672 },
  c9q34: { src: 'img/tests/c9q34.webp', w: 1915, h: 821, lamps: [{ el: [642,621,12.1,9.7,0], glow: 22, soft: true }, { el: [996,658,6.2,12,0], glow: 15, soft: true }] },
  c9q35: { src: 'img/tests/c9q35.webp', w: 1571, h: 672 },
  c9q36: { src: 'img/tests/c9q36.webp', w: 1946, h: 808 },
  c9q37: { src: 'img/tests/c9q37.webp', w: 1578, h: 672, lamps: [{ el: [644,200,7,5.2,-8], glow: 12, soft: true }, { el: [755,244,7.1,5.7,0], glow: 13, soft: true }, { el: [887,184,7.1,5.7,0], glow: 13, soft: true }] },
  c9q38: { src: 'img/tests/c9q38.webp', w: 1905, h: 825 },
  c9q39: { src: 'img/tests/c9q39.webp', w: 1905, h: 825 },
  c9q40: { src: 'img/tests/c9q40.webp', w: 1568, h: 672 },
  c9q41: { src: 'img/tests/c9q41.webp', w: 1564, h: 672, lamps: [{ el: [1151,261,7.6,5.2,-6], glow: 13, soft: true }, { el: [1453,319,9,5.8,8], glow: 14, soft: true }, { el: [310,489,5.4,6,0], glow: 10, soft: true }] },
  c9q42: { src: 'img/tests/c9q42.webp', w: 1919, h: 820, lamps: [{ el: [150,646,8.6,10,0], glow: 15, soft: true }, { el: [1416,281,9,5.4,-12], glow: 15, soft: true }, { el: [1545,203,4.4,8,0], glow: 11, soft: true }] },
  c9q43: { src: 'img/tests/c9q43.webp', w: 1915, h: 821 },
  c9q44: { src: 'img/tests/c9q44.webp', w: 1915, h: 821 },
  c9q45: { src: 'img/tests/c9q45.webp', w: 1909, h: 824 },
  c9q46: { src: 'img/tests/c9q46.webp', w: 1918, h: 820 },
  c9q47: { src: 'img/tests/c9q47.webp', w: 1909, h: 824, lamps: [{ el: [26,646,6,10,0], glow: 13, soft: true }, { el: [306,620,10,5.6,-10], glow: 15, soft: true }, { el: [918,440,5,11,0], glow: 11, soft: true }, { el: [1307,342,8,10,0], glow: 14, soft: true }, { el: [1410,220,7,13,0], glow: 14, soft: true }] },
  c9q48: { src: 'img/tests/c9q48.webp', w: 1910, h: 823, lamps: [{ el: [893,409,8.6,6.9,0], glow: 15, soft: true }] },
  c9q49: { src: 'img/tests/c9q49.webp', w: 1921, h: 819, lamps: [{ el: [706,476,5,9,0], glow: 11, soft: true }, { el: [328,664,8,10,0], glow: 14, soft: true }, { el: [797,574,4.4,8,0], glow: 10, soft: true }, { el: [524,707,12,6.4,-4], glow: 16, soft: true }] },
  c9q50: { src: 'img/tests/c9q50.webp', w: 1921, h: 819, lamps: [{ el: [679,457,10.4,8.3,0], glow: 19, soft: true }, { el: [292,630,7.4,9.6,0], glow: 14, soft: true }, { el: [760,562,11.2,9,0], glow: 20, soft: true }, { el: [488,677,12,6.6,-4], glow: 16, soft: true }] },
  c9q51: { src: 'img/tests/c9q51.webp', w: 1557, h: 672 },
  c9q52: { src: 'img/tests/c9q52.webp', w: 1561, h: 672 },
  c9q53: { src: 'img/tests/c9q53.webp', w: 1919, h: 820, lamps: [{ el: [1486,345,8,5.6,20], glow: 14, soft: true }, { el: [1781,437,12,9.6,0], glow: 17, soft: true }] },
  c9q54: { src: 'img/tests/c9q54.webp', w: 1915, h: 821, lamps: [{ el: [387,365,10.3,8.2,0], glow: 19, soft: true }] },
  c9q55: { src: 'img/tests/c9q55.webp', w: 1564, h: 672, lamps: [{ el: [26,503,9.9,7.9,0], glow: 18, soft: true }, { el: [475,83,5.6,4.5,0], glow: 10, soft: true }, { el: [818,500,9.9,7.9,0], glow: 18, soft: true }, { el: [1277,75,5.6,4.5,0], glow: 10, soft: true }] },
  c9q56: { src: 'img/tests/c9q56.webp', w: 1574, h: 672, lamps: [{ el: [681,433,9.2,7.4,0], glow: 17, soft: true }, { el: [436,574,10.6,8.5,0], glow: 19, soft: true }] },
  c9q57: { src: 'img/tests/c9q57.webp', w: 1926, h: 817, lamps: [{ el: [977,571,8.6,12,0], glow: 15, soft: true }, { el: [1340,532,11.3,9,0], glow: 20, soft: true }] },
  c9q58: { src: 'img/tests/c9q58.webp', w: 1396, h: 589, lamps: [{ el: [1008,340,6.9,5.5,0], glow: 12, soft: true }, { el: [1142,420,7.5,6,0], glow: 14, soft: true }, { el: [1094,279,6.3,5,0], glow: 11, soft: true }, { el: [1290,386,7.5,6,0], glow: 14, soft: true }] },
  c9q59: { src: 'img/tests/c9q59.webp', w: 1532, h: 688, lamps: [{ el: [613,458,6.9,5.5,0], glow: 12, soft: true }, { el: [243,619,9,7.2,0], glow: 16, soft: true }] },
  c9q60: { src: 'img/tests/c9q60.webp', w: 1568, h: 687, lamps: [{ el: [331,479,8.5,6.8,0], glow: 15, soft: true }] },
  c9q61: { src: 'img/tests/c9q61.webp', w: 1911, h: 823, lamps: [{ el: [836,323,8.6,6.9,0], glow: 15, soft: true }, { el: [933,304,8.6,6.9,0], glow: 15, soft: true }, { el: [1392,591,11.2,9,0], glow: 20, soft: true }, { el: [1738,669,11.2,9,0], glow: 20, soft: true }] },
  c9q62: { src: 'img/tests/c9q62.webp', w: 1585, h: 672, lamps: [{ el: [1092,200,4.6,8,0], glow: 11, soft: true }] },
  c9q63: { src: 'img/tests/c9q63.webp', w: 1926, h: 817 },
  c9q64: { src: 'img/tests/c9q64.webp', w: 1568, h: 672, lamps: [{ el: [258,479,9.9,7.9,0], glow: 18, soft: true }, { el: [1190,137,4.4,6,0], white: true }, { el: [1274,157,7,4.4,-6], white: true }] },
  c9q65: { src: 'img/tests/c9q65.webp', w: 1571, h: 672 },
  c9q66: { src: 'img/tests/c9q66.webp', w: 1922, h: 818 },
  c9q67: { src: 'img/tests/c9q67.webp', w: 1918, h: 820, lamps: [{ el: [1519,627,11.2,9,0], glow: 20, soft: true }, { el: [1757,713,12,6.4,6], glow: 17, soft: true }] },
  c9q68: { src: 'img/tests/c9q68.webp', w: 1585, h: 672 },
  c9q69: { src: 'img/tests/c9q69.webp', w: 1578, h: 672 },
  c9q70: { src: 'img/tests/c9q70.webp', w: 1541, h: 672 },
  c9q71: { src: 'img/tests/c9q71.webp', w: 1571, h: 672, lamps: [{ el: [1313,159,7.5,6.0,0], glow: 14, soft: true }, { el: [1483,130,7,5.6,0], glow: 13, soft: true }, { el: [1241,141,5,5,0], white: true }, { el: [1296,151,5,5,0], white: true }] },
  c9q72: { src: 'img/tests/c9q72.webp', w: 1551, h: 672, lamps: [{ el: [406,256,7,5.6,0], glow: 13, soft: true }, { el: [344,277,6,6,0], white: true }, { el: [412,263,6,6,0], white: true }] },
  c9q73: { src: 'img/tests/c9q73.webp', w: 1588, h: 672, lamps: [{ el: [347,187,6,6,0], white: true }, { el: [390,181,5,5,0], white: true }, { el: [406,176,4.4,7,0], glow: 10, soft: true }] },
  c9q74: { src: 'img/tests/c9q74.webp', w: 1568, h: 672, lamps: [{ el: [1400,77,5,5,0], white: true }, { el: [1480,81,5,5,0], white: true }] },
  c9q75: { src: 'img/tests/c9q75.webp', w: 1574, h: 672, lamps: [{ el: [1309,262,6,6,0], white: true }, { el: [1427,262,6,6,0], white: true }] },
  c9q76: { src: 'img/tests/c9q76.webp', w: 1592, h: 672, lamps: [{ el: [77,113,6,6,0], white: true }, { el: [158,112,4.6,4.6,0], white: true }, { el: [172,106,4.2,7,0], glow: 10, soft: true }] },
  c9q77: { src: 'img/tests/c9q77.webp', w: 1568, h: 672, lamps: [{ el: [124,124,6,6,0], white: true }, { el: [198,123,4.4,4.4,0], white: true }, { el: [207,120,4.2,8,0], glow: 10, soft: true }] },
  c9q78: { src: 'img/tests/c9q78.webp', w: 1557, h: 672, lamps: [{ el: [1161,168,6,6,0], white: true }, { el: [1246,176,6,6,0], white: true }] },
  c9q79: { src: 'img/tests/c9q79.webp', w: 1574, h: 672, lamps: [{ el: [910,400,3.2,3.6,0], white: true }, { el: [980,404,2.6,3,0], white: true }, { el: [985,395,2.8,6.4,0], glow: 7, soft: true }] },
  c9q80: { src: 'img/tests/c9q80.webp', w: 1195, h: 896 },
  c10q01: { src: 'img/tests/c10q01.webp', w: 1914, h: 822 },
  c10q02: { src: 'img/tests/c10q02.webp', w: 1913, h: 822 },
  c10q03: { src: 'img/tests/c10q03.webp', w: 1914, h: 822 },
  c10q04: { src: 'img/tests/c10q04.webp', w: 1926, h: 816 },
  c10q05: { src: 'img/tests/c10q05.webp', w: 1941, h: 810 },
  c10q06: { src: 'img/tests/c10q06.webp', w: 1911, h: 823 },
  c10q07: { src: 'img/tests/c10q07.webp', w: 1930, h: 815 },
  c10q08: { src: 'img/tests/c10q08.webp', w: 1913, h: 822 },
  c10q10: { src: 'img/tests/c10q10.webp', w: 1909, h: 824 },
  c10q11: { src: 'img/tests/c10q11.webp', w: 1916, h: 821 },
  c10q12: { src: 'img/tests/c10q12.webp', w: 1915, h: 821 },
  c10q13: { src: 'img/tests/c10q13.webp', w: 1915, h: 821 },
  c10q14: { src: 'img/tests/c10q14.webp', w: 1921, h: 819 },
  c10q15: { src: 'img/tests/c10q15.webp', w: 1942, h: 810 },
  c10q17: { src: 'img/tests/c10q17.webp', w: 1915, h: 821 },
  c10q18: { src: 'img/tests/c10q18.webp', w: 1923, h: 817 },
  c10q19: { src: 'img/tests/c10q19.webp', w: 1926, h: 816 },
  c10q20: { src: 'img/tests/c10q20.webp', w: 1916, h: 821 },
  c10q21: { src: 'img/tests/c10q21.webp', w: 1921, h: 819 },
  c10q22: { src: 'img/tests/c10q22.webp', w: 1921, h: 819 },
  c10q23: { src: 'img/tests/c10q23.webp', w: 1940, h: 811 },
  c10q24: { src: 'img/tests/c10q24.webp', w: 1908, h: 824 },
  c10q25: { src: 'img/tests/c10q25.webp', w: 1581, h: 656 },
  c10q26: { src: 'img/tests/c10q26.webp', w: 1923, h: 817 },
  c10q27: { src: 'img/tests/c10q27.webp', w: 1595, h: 672 },
  c10q28: { src: 'img/tests/c10q28.webp', w: 1918, h: 820 },
  c10q30: { src: 'img/tests/c10q30.webp', w: 1927, h: 816 },
  c10q32: { src: 'img/tests/c10q32.webp', w: 1581, h: 672 },
  c10q33: { src: 'img/tests/c10q33.webp', w: 1581, h: 672 },
  c10q34: { src: 'img/tests/c10q34.webp', w: 1940, h: 810 },
  c10q35: { src: 'img/tests/c10q35.webp', w: 1581, h: 672 },
  c10q36: { src: 'img/tests/c10q36.webp', w: 1935, h: 812 },
  c10q37: { src: 'img/tests/c10q37.webp', w: 1595, h: 672 },
  c10q38: { src: 'img/tests/c10q38.webp', w: 1568, h: 672 },
  c10q39: { src: 'img/tests/c10q39.webp', w: 1934, h: 813 },
  c10q40: { src: 'img/tests/c10q40.webp', w: 1913, h: 822 },
  c10q41: { src: 'img/tests/c10q41.webp', w: 1564, h: 672 },
  c10q42: { src: 'img/tests/c10q42.webp', w: 1923, h: 817 },
  c10q43: { src: 'img/tests/c10q43.webp', w: 1571, h: 656 },
  c10q44: { src: 'img/tests/c10q44.webp', w: 1581, h: 672 },
  c10q45: { src: 'img/tests/c10q45.webp', w: 1942, h: 809 },
  c10q46: { src: 'img/tests/c10q46.webp', w: 1581, h: 672 },
  c10q47: { src: 'img/tests/c10q47.webp', w: 1939, h: 811 },
  c10q48: { src: 'img/tests/c10q48.webp', w: 1939, h: 811 },
  c10q49: { src: 'img/tests/c10q49.webp', w: 1926, h: 817 },
  c10q50: { src: 'img/tests/c10q50.webp', w: 1915, h: 821 },
  c10q51: { src: 'img/tests/c10q51.webp', w: 1925, h: 817 },
  c10q52: { src: 'img/tests/c10q52.webp', w: 1940, h: 810 },
  c10q53: { src: 'img/tests/c10q53.webp', w: 1923, h: 818 },
  c10q54: { src: 'img/tests/c10q54.webp', w: 1918, h: 820 },
  c10q55: { src: 'img/tests/c10q55.webp', w: 1932, h: 814 },
  c10q56: { src: 'img/tests/c10q56.webp', w: 1564, h: 672 },
  c10q57: { src: 'img/tests/c10q57.webp', w: 1551, h: 672 },
  c10q58: { src: 'img/tests/c10q58.webp', w: 1909, h: 824 },
  c10q59: { src: 'img/tests/c10q59.webp', w: 1926, h: 817 },
  c10q60: { src: 'img/tests/c10q60.webp', w: 1908, h: 824 },
  c10q61: { src: 'img/tests/c10q61.webp', w: 1893, h: 831 },
  c10q62: { src: 'img/tests/c10q62.webp', w: 1913, h: 822 },
  c10q63: { src: 'img/tests/c10q63.webp', w: 1933, h: 813 },
  c10q64: { src: 'img/tests/c10q64.webp', w: 1585, h: 672 },
  c10q66: { src: 'img/tests/c10q66.webp', w: 1918, h: 820 },
  c10q67: { src: 'img/tests/c10q67.webp', w: 1897, h: 829 },
  c10q68: { src: 'img/tests/c10q68.webp', w: 1919, h: 820 },
  c10q69: { src: 'img/tests/c10q69.webp', w: 1915, h: 821 },
  c10q70: { src: 'img/tests/c10q70.webp', w: 1914, h: 822 },
  c10q72: { src: 'img/tests/c10q72.webp', w: 1590, h: 811 },
  c10q73: { src: 'img/tests/c10q73.webp', w: 1459, h: 636 },
  c10q74: { src: 'img/tests/c10q74.webp', w: 1926, h: 817 },
  c10q75: { src: 'img/tests/c10q75.webp', w: 1926, h: 817 },
  c10q76: { src: 'img/tests/c10q76.webp', w: 1574, h: 656 },
  c10q77: { src: 'img/tests/c10q77.webp', w: 1751, h: 821 },
  c10q78: { src: 'img/tests/c10q78.webp', w: 1933, h: 813 },
  c14q01: { src: 'img/tests/c14q01.webp', w: 1946, h: 808 },
  c14q02: { src: 'img/tests/c14q02.webp', w: 1581, h: 656 },
  c14q03: { src: 'img/tests/c14q03.webp', w: 1962, h: 801 },
  c14q04: { src: 'img/tests/c14q04.webp', w: 1583, h: 656 },
  c14q05: { src: 'img/tests/c14q05.webp', w: 1607, h: 656 },
  c14q06: { src: 'img/tests/c14q06.webp', w: 1595, h: 672, lamps: [{ el: [93,575,8,20,0], glow: 18, soft: true }, { el: [437,461,13,7,20], glow: 16, soft: true }] },
  c14q07: { src: 'img/tests/c14q07.webp', w: 1610, h: 656 },
  c14q08: { src: 'img/tests/c14q08.webp', w: 1942, h: 809 },
  c14q09: { src: 'img/tests/c14q09.webp', w: 1600, h: 670 },
  c14q10: { src: 'img/tests/c14q10.webp', w: 1944, h: 809 },
  c14q11: { src: 'img/tests/c14q11.webp', w: 1588, h: 672 },
  c14q12: { src: 'img/tests/c14q12.webp', w: 1933, h: 813, lamps: [{ el: [730,291,4,9,0], glow: 10, soft: true }] },
  c14q13: { src: 'img/tests/c14q13.webp', w: 1581, h: 672 },
  c14q14: { src: 'img/tests/c14q14.webp', w: 1935, h: 813, lamps: [{ el: [886,300,9,13,0], glow: 13, soft: true }] },
  c14q15: { src: 'img/tests/c14q15.webp', w: 1595, h: 672, lamps: [{ el: [747,281,11,8,0], glow: 14, soft: true }] },
  c14q16: { src: 'img/tests/c14q16.webp', w: 1568, h: 672 },
  c14q17: { src: 'img/tests/c14q17.webp', w: 1935, h: 813 },
  c14q18: { src: 'img/tests/c14q18.webp', w: 1581, h: 656 },
  c14q19: { src: 'img/tests/c14q19.webp', w: 1921, h: 819, lamps: [{ el: [766,266,5,9,0], glow: 12, soft: true }] },
  c14q20: { src: 'img/tests/c14q20.webp', w: 1905, h: 825 },
  c14q21: { src: 'img/tests/c14q21.webp', w: 1922, h: 818, lamps: [{ el: [1406,331,18,7,-5], glow: 16, soft: true }, { el: [1801,308,11,7,8], glow: 14, soft: true }] },
  c14q22: { src: 'img/tests/c14q22.webp', w: 1581, h: 672, lamps: [{ el: [286,343,9,14,0], glow: 14, soft: true }] },
  c14q23: { src: 'img/tests/c14q23.webp', w: 1920, h: 819, lamps: [{ el: [1421,319,5,10,0], glow: 11, soft: true }] },
  c14q24: { src: 'img/tests/c14q24.webp', w: 1599, h: 672, lamps: [{ el: [504,193,6,5,0], glow: 12, soft: true }, { el: [565,193,6,5,0], glow: 12, soft: true }, { el: [574,295,5,8,0], glow: 12, soft: true }] },
  c14q25: { src: 'img/tests/c14q25.webp', w: 1954, h: 805, sound: { x: 228, y: 204, burst: true, R: 125, fs: 44, span: 160 }, beams: [{ rect: [184,208,238,221], col: '#2a62ff', alt: 1, glow: 14 }, { rect: [246,208,271,221], col: '#ff2a1a', alt: 0, glow: 11 }] },
  c14q26: { src: 'img/tests/c14q26.webp', w: 1600, h: 670, lamps: [{ el: [313,334,13,7,8], glow: 13, soft: true }] },
  c14q27: { src: 'img/tests/c14q27.webp', w: 1574, h: 656, lamps: [{ el: [1145,358,12,8,0], glow: 14, soft: true }, { el: [1479,353,4,14,0], glow: 11, soft: true }] },
  c14q28: { src: 'img/tests/c14q28.webp', w: 1945, h: 809, lamps: [{ el: [1465,319,12,8,0], glow: 14, soft: true }, { el: [1823,376,14,8,0], glow: 14, soft: true }, { el: [597,697,8,6,0], glow: 11, soft: true }] },
  c14q29: { src: 'img/tests/c14q29.webp', w: 1596, h: 656 },
  c14q30: { src: 'img/tests/c14q30.webp', w: 1926, h: 816 },
  c14q31: { src: 'img/tests/c14q31.webp', w: 1599, h: 672 },
  c14q32: { src: 'img/tests/c14q32.webp', w: 1935, h: 812 },
  c14q33: { src: 'img/tests/c14q33.webp', w: 1921, h: 819, lamps: [{ el: [1414,158,14,6,-8], glow: 14, soft: true }] },
  c14q34: { src: 'img/tests/c14q34.webp', w: 1581, h: 656, lamps: [{ el: [313,312,6,10,0], glow: 12, soft: true }] },
  c14q35: { src: 'img/tests/c14q35.webp', w: 1956, h: 804 },
  c14q36: { src: 'img/tests/c14q36.webp', w: 1588, h: 672 },
  c14q37: { src: 'img/tests/c14q37.webp', w: 1939, h: 811, lamps: [{ el: [885,273,6,10,0], glow: 12, soft: true }] },
  c14q38: { src: 'img/tests/c14q38.webp', w: 1914, h: 822, lamps: [{ el: [1564,303,6,5,0], glow: 10, soft: true }, { el: [1396,288,8,10,0], glow: 11, soft: true }] },
  c14q39: { src: 'img/tests/c14q39.webp', w: 1578, h: 672 },
  c14q40: { src: 'img/tests/c14q40.webp', w: 1913, h: 822, lamps: [{ el: [1568,300,6,5,0], glow: 10, soft: true }, { el: [1400,285,8,10,0], glow: 11, soft: true }] },
  c14q41: { src: 'img/tests/c14q41.webp', w: 1599, h: 672, lamps: [{ el: [469,240,6,9,0], glow: 12, soft: true }, { el: [470,548,6,14,0], glow: 13, soft: true }] },
  c14q42: { src: 'img/tests/c14q42.webp', w: 1905, h: 826 },
  c14q43: { src: 'img/tests/c14q43.webp', w: 1930, h: 815, lamps: [{ el: [828,282,9,7,0], glow: 12, soft: true }] },
  c14q44: { src: 'img/tests/c14q44.webp', w: 1918, h: 820 },
  c14q45: { src: 'img/tests/c14q45.webp', w: 1592, h: 672 },
  c14q46: { src: 'img/tests/c14q46.webp', w: 1916, h: 821, lamps: [{ el: [873,254,7,9,0], glow: 12, soft: true }] },
  c14q47: { src: 'img/tests/c14q47.webp', w: 1600, h: 671, lamps: [{ el: [624,269,12,8,0], glow: 13, soft: true }, { el: [1312,153,8,8,0], glow: 13, soft: true }] },
  c14q48: { src: 'img/tests/c14q48.webp', w: 1928, h: 816, lamps: [{ el: [1799,316,8,12,0], glow: 12, soft: true }, { el: [1316,326,13,6,-8], glow: 12, soft: true }] },
  c14q49: { src: 'img/tests/c14q49.webp', w: 1581, h: 672 },
  c14q50: { src: 'img/tests/c14q50.webp', w: 1585, h: 672, lamps: [{ el: [687,289,12,6,0], glow: 13, soft: true }] },
  c14q51: { src: 'img/tests/c14q51.webp', w: 1909, h: 824, lamps: [{ el: [452,244,6,10,0], glow: 12, soft: true }] },
  c14q52: { src: 'img/tests/c14q52.webp', w: 1588, h: 672, lamps: [{ el: [264,463,5,14,0], glow: 12, soft: true }] },
  c14q53: { src: 'img/tests/c14q53.webp', w: 1933, h: 814, lamps: [{ el: [865,268,18,10,0], glow: 14, soft: true }, { el: [1212,310,12,10,0], glow: 13, soft: true }, { el: [1348,165,10,5,0], glow: 12, soft: true }] },
  c14q54: { src: 'img/tests/c14q54.webp', w: 1930, h: 815, sound: { x: 1450, y: 135, dx: 60, dy: -110, fs: 44, col: '#22c55e' }, beams: [{ rect: [1424,143,1456,157], col: '#2ad66a', alt: 0, glow: 11 }, { rect: [1462,146,1497,161], col: '#2ad66a', alt: 1, glow: 11 }], lamps: [{ el: [1380,296,8,6,-15], glow: 11, soft: true }] },
  c14q55: { src: 'img/tests/c14q55.webp', w: 1561, h: 672 },
  c14q56: { src: 'img/tests/c14q56.webp', w: 1926, h: 817, lamps: [{ el: [832,285,16,8,0], glow: 13, soft: true }] },
  c14q57: { src: 'img/tests/c14q57.webp', w: 1596, h: 656 },
  c14q58: { src: 'img/tests/c14q58.webp', w: 1925, h: 817 },
  c14q59: { src: 'img/tests/c14q59.webp', w: 1571, h: 656 },
  c14q60: { src: 'img/tests/c14q60.webp', w: 1914, h: 822, lamps: [{ el: [851,280,14,10,0], glow: 14, soft: true }] },
  c14q61: { src: 'img/tests/c14q61.webp', w: 1585, h: 672, lamps: [{ el: [387,376,7,6,0], glow: 12, soft: true }] },
  c14q62: { src: 'img/tests/c14q62.webp', w: 1925, h: 817, lamps: [{ el: [776,229,4,5,0], glow: 8, soft: true }] },
  c14q63: { src: 'img/tests/c14q63.webp', w: 1561, h: 672, lamps: [{ el: [716,286,12,9,0], glow: 13, soft: true }] },
  c14q64: { src: 'img/tests/c14q64.webp', w: 1935, h: 813, lamps: [{ el: [1778,316,7,5,0], glow: 11, soft: true }, { el: [1589,284,7,9,0], glow: 11, soft: true }] },
  c14q65: { src: 'img/tests/c14q65.webp', w: 1600, h: 670 },
  c14q66: { src: 'img/tests/c14q66.webp', w: 1925, h: 817, lamps: [{ el: [1319,257,10,9,0], glow: 13, soft: true }, { el: [1400,274,8,4,0], glow: 10, soft: true }] },
  c14q67: { src: 'img/tests/c14q67.webp', w: 1595, h: 672, lamps: [{ el: [402,314,8,4,0], glow: 11, soft: true }, { el: [1154,288,10,5,0], glow: 11, soft: true }] },
  c14q68: { src: 'img/tests/c14q68.webp', w: 1909, h: 824 },
  c14q69: { src: 'img/tests/c14q69.webp', w: 1585, h: 672, lamps: [{ el: [487,545,6,14,0], glow: 13, soft: true }, { el: [466,211,8,10,0], glow: 12, soft: true }] },
  c14q70: { src: 'img/tests/c14q70.webp', w: 1908, h: 824, sound: { x: 618, y: 490, burst: true, R: 160, fs: 54, span: 160 }, beams: [{ rect: [545,493,592,508], col: '#ff2a1a', alt: 0, glow: 13 }, { rect: [628,503,692,519], col: '#2a62ff', alt: 1, glow: 15 }], lamps: [{ el: [374,678,6,15,0], glow: 13, soft: true }, { el: [594,244,6,10,0], glow: 12, soft: true }] },
  /* бүлэг 15–24: ТҮР зураг = хуучин апп-ын SS-ийн зураг (хайчилсан). ChatGPT зураг ирмэгц ижил нэрээр солино. */
  c15q01: { src: 'img/tests/c15q01.webp', w: 1909, h: 824 },
  c15q02: { src: 'img/tests/c15q02.webp', w: 1581, h: 672 },
  c15q03: { src: 'img/tests/c15q03.webp', w: 1910, h: 823 },
  c15q04: { src: 'img/tests/c15q04.webp', w: 1571, h: 672 },
  c15q05: { src: 'img/tests/c15q05.webp', w: 1561, h: 672, lamps: [{ el: [1051,291,9,9,0], glow: 14, soft: true }, { el: [1051,310,9,9,0], glow: 14, soft: true }, { el: [1372,288,9,9,0], glow: 14, soft: true }, { el: [1372,308,9,9,0], glow: 14, soft: true }] },
  c15q06: { src: 'img/tests/c15q06.webp', w: 1910, h: 823 },
  c15q07: { src: 'img/tests/c15q07.webp', w: 1581, h: 672 },
  c15q08: { src: 'img/tests/c15q08.webp', w: 1910, h: 823, lamps: [{ el: [1154,368,10,8,0], glow: 14, soft: true }, { el: [1461,365,10,8,0], glow: 14, soft: true }] },
  c15q09: { src: 'img/tests/c15q09.webp', w: 1574, h: 672, lamps: [{ el: [191,294,6,8,0], glow: 14, soft: true }, { el: [390,295,6,8,0], glow: 14, soft: true }] },
  c15q10: { src: 'img/tests/c15q10.webp', w: 1910, h: 823 },
  c16q02: { src: 'img/tests/c16q02.webp', w: 1672, h: 941 },
  c16q05: { src: 'img/tests/c16q05.webp', w: 1910, h: 823 },
  c16q06: { src: 'img/tests/c16q06.webp', w: 1592, h: 672 },
  c16q07: { src: 'img/tests/c16q07.webp', w: 1574, h: 672 },
  c16q08: { src: 'img/tests/c16q08.webp', w: 1571, h: 672 },
  c16q09: { src: 'img/tests/c16q09.webp', w: 1910, h: 823 },
  c16q10: { src: 'img/tests/c16q10.webp', w: 1910, h: 823 },
  c16q11: { src: 'img/tests/c16q11.webp', w: 1578, h: 656 },
  c16q12: { src: 'img/tests/c16q12.webp', w: 1910, h: 823 },
  c16q13: { src: 'img/tests/c16q13.webp', w: 1910, h: 823 },
  c16q14: { src: 'img/tests/c16q14.webp', w: 1909, h: 824 },
  c16q18: { src: 'img/tests/c16q18.webp', w: 1934, h: 813, lamps: [{ el: [590,547,9,7,0], glow: 16, soft: true }, { el: [785,508,9,7,0], glow: 16, soft: true }] },
  c17q04: { src: 'img/tests/c17q04.webp', w: 1574, h: 672 },
  c17q05: { src: 'img/tests/c17q05.webp', w: 1910, h: 823 },
  c17q07: { src: 'img/tests/c17q07.webp', w: 1932, h: 814 },
  c17q09: { src: 'img/tests/c17q09.webp', w: 1561, h: 672 },
  c18q01: { src: 'img/tests/c18q01.webp', w: 1588, h: 672 },
  c18q02: { src: 'img/tests/c18q02.webp', w: 1934, h: 813 },
  c18q03: { src: 'img/tests/c18q03.webp', w: 1571, h: 672 },
  c18q04: { src: 'img/tests/c18q04.webp', w: 1916, h: 821 },
  c18q05: { src: 'img/tests/c18q05.webp', w: 1564, h: 672 },
  c18q06: { src: 'img/tests/c18q06.webp', w: 1916, h: 821 },
  c18q07: { src: 'img/tests/c18q07.webp', w: 1915, h: 821, lamps: [{ el: [996,595,6,14,-8], glow: 16, soft: true }, { el: [1446,714,5,15,-10], glow: 16, soft: true }] },
  c18q09: { src: 'img/tests/c18q09.webp', w: 1595, h: 672 },
  c18q10: { src: 'img/tests/c18q10.webp', w: 1588, h: 672 },
  c19q04: { src: 'img/tests/c19q04.webp', w: 1928, h: 816 },
  c19q06: { src: 'img/tests/c19q06.webp', w: 1592, h: 672, lamps: [{ el: [368,98,7,6,0], glow: 14, soft: true }, { el: [1022,268,10,8,0], glow: 18, soft: true }, { el: [897,350,8,10,0], glow: 14, soft: true }, { el: [1118,588,10,8,0], glow: 14, soft: true }] },
  c19q07: { src: 'img/tests/c19q07.webp', w: 1568, h: 672 },
  c19q08: { src: 'img/tests/c19q08.webp', w: 1915, h: 821 },
  c19q09: { src: 'img/tests/c19q09.webp', w: 1600, h: 670 },
  c19q10: { src: 'img/tests/c19q10.webp', w: 1923, h: 818 },
  c20q07: { src: 'img/tests/c20q07.webp', w: 1918, h: 820, lamps: [{ el: [380,540,7,18,0], glow: 14, soft: true }, { el: [547,566,9,22,0], glow: 14, soft: true }, { el: [888,466,8,6,0], glow: 14, soft: true }, { el: [1166,238,8,10,0], glow: 14, soft: true }, { el: [1295,248,18,10,-10], glow: 14, soft: true }] },
  c20q08: { src: 'img/tests/c20q08.webp', w: 1920, h: 819, lamps: [{ el: [108,572,6,14,0], glow: 14, soft: true }, { el: [212,636,12,24,0], glow: 14, soft: true }, { el: [722,545,8,6,0], glow: 14, soft: true }, { el: [1225,337,10,14,0], glow: 14, soft: true }, { el: [1375,378,14,10,0], glow: 14, soft: true }] },
  c20q10: { src: 'img/tests/c20q10.webp', w: 1916, h: 821, lamps: [{ el: [518,462,7,16,0], glow: 14, soft: true }, { el: [672,490,14,10,0], glow: 14, soft: true }, { el: [1432,224,6,14,0], glow: 14, soft: true }, { el: [1630,242,10,18,0], glow: 14, soft: true }, { el: [70,642,6,10,0], glow: 14, soft: true }, { el: [180,672,6,10,0], glow: 14, soft: true }] },
  c21q05: { src: 'img/tests/c21q05.webp', w: 1210, h: 672 },
  c21q06: { src: 'img/tests/c21q06.webp', w: 1547, h: 672 },
  c21q08: { src: 'img/tests/c21q08.webp', w: 1561, h: 672 },
  c21q10: { src: 'img/tests/c21q10.webp', w: 1564, h: 672 },
  c21q11: { src: 'img/tests/c21q11.webp', w: 1944, h: 809 },
  c21q12: { src: 'img/tests/c21q12.webp', w: 1600, h: 671 },
  c21q14: { src: 'img/tests/c21q14.webp', w: 1568, h: 672 },
  c21q17: { src: 'img/tests/c21q17.webp', w: 1907, h: 825 },
  c21q19: { src: 'img/tests/c21q19.webp', w: 1933, h: 814 },
  c22q08: { src: 'img/tests/c22q08.webp', w: 1600, h: 670, labels: [{ l: 'А', x: 345, y: 440, fs: 52 }, { l: 'Б', x: 665, y: 585, fs: 52 }, { l: 'В', x: 905, y: 560, fs: 52 }] },
  /* C, D, E ангилал — x<бүлэг>q<асуулт> */
  x01q05: { src: 'img/tests/x01q05.webp', w: 1920, h: 801 },
  x02q02: { src: 'img/tests/x02q02.webp', w: 1581, h: 656 },
  x02q03: { src: 'img/tests/x02q03.webp', w: 1629, h: 656 },
  x02q09: { src: 'img/tests/x02q09.webp', w: 1920, h: 816 },
  x03q01: { src: 'img/tests/x03q01.webp', w: 1920, h: 800 },
  x03q02: { src: 'img/tests/x03q02.webp', w: 1080, h: 447 },
  x03q03: { src: 'img/tests/x03q03.webp', w: 1080, h: 447 },
  x03q04: { src: 'img/tests/x03q04.webp', w: 1920, h: 791 },
  x03q05: { src: 'img/tests/x03q05.webp', w: 1080, h: 447 },
  x03q06: { src: 'img/tests/x03q06.webp', w: 1774, h: 887 },
  x03q07: { src: 'img/tests/x03q07.webp', w: 1920, h: 768 },
  x03q08: { src: 'img/tests/x03q08.webp', w: 1920, h: 811 },
  x03q09: { src: 'img/tests/x03q09.webp', w: 1080, h: 447 },
  x03q10: { src: 'img/tests/x03q10.webp', w: 1080, h: 447 },
  x03q11: { src: 'img/tests/x03q11.webp', w: 1844, h: 853 },
  x03q12: { src: 'img/tests/x03q12.webp', w: 1844, h: 853 },
  x03q13: { src: 'img/tests/x03q13.webp', w: 1774, h: 887 },
  x03q14: { src: 'img/tests/x03q14.webp', w: 1774, h: 887 },
  x03q15: { src: 'img/tests/x03q15.webp', w: 1920, h: 791, lamps: [{ el: [1337,565,8,10,0], glow: 14, soft: true }] },
  x03q16: { src: 'img/tests/x03q16.webp', w: 1920, h: 791, lamps: [{ el: [1330,564,8,10,0], glow: 14, soft: true }] },
  x03q17: { src: 'img/tests/x03q17.webp', w: 1774, h: 887 },
  x03q18: { src: 'img/tests/x03q18.webp', w: 1080, h: 447 },
  x03q19: { src: 'img/tests/x03q19.webp', w: 1774, h: 887 },
  x03q20: { src: 'img/tests/x03q20.webp', w: 1920, h: 791, lamps: [{ el: [1014,526,10,7,0], glow: 14, soft: true }] },
  x03q21: { src: 'img/tests/x03q21.webp', w: 1080, h: 447 },
  x03q22: { src: 'img/tests/x03q22.webp', w: 1774, h: 887 },
  x03q23: { src: 'img/tests/x03q23.svg', w: 1080, h: 447 },
  x03q24: { src: 'img/tests/x03q24.webp', w: 1080, h: 447 },
  x03q25: { src: 'img/tests/x03q25.webp', w: 1920, h: 800, lamps: [{ el: [1378,685,10,7,0], glow: 14, soft: true }] },
  x03q26: { src: 'img/tests/x03q26.webp', w: 1080, h: 447 },
  x03q27: { src: 'img/tests/x03q27.webp', w: 1774, h: 887 },
  x03q28: { src: 'img/tests/x03q28.webp', w: 1774, h: 887 },
  x03q29: { src: 'img/tests/x03q29.webp', w: 1774, h: 887 },
  x03q30: { src: 'img/tests/x03q30.webp', w: 1774, h: 887 },
  x03q31: { src: 'img/tests/x03q31.webp', w: 1774, h: 887, lamps: [{ el: [1210,358,4,9,0], glow: 14, soft: true }, { el: [1008,488,9,9,0], glow: 14, soft: true }, { el: [781,611,9,9,0], glow: 14, soft: true }, { el: [414,725,7,9,0], glow: 14, soft: true }, { el: [527,757,8,7,0], glow: 14, soft: true }] },
  x03q32: { src: 'img/tests/x03q32.webp', w: 1774, h: 887 },
  x03q33: { src: 'img/tests/x03q33.webp', w: 1920, h: 772, lamps: [{ el: [1019,388,4,10,0], glow: 14, soft: true }] },
  x03q34: { src: 'img/tests/x03q34.webp', w: 1920, h: 766 },
  x03q35: { src: 'img/tests/x03q35.webp', w: 1080, h: 447 },
  x03q36: { src: 'img/tests/x03q36.webp', w: 1080, h: 447 },
  x03q37: { src: 'img/tests/x03q37.webp', w: 1080, h: 447 },
  x03q38: { src: 'img/tests/x03q38.webp', w: 1080, h: 447 },
  x03q39: { src: 'img/tests/x03q39.webp', w: 1080, h: 447 },
  x03q40: { src: 'img/tests/x03q40.webp', w: 1080, h: 447 },
  x04q05: { src: 'img/tests/x04q05.webp', w: 1774, h: 887 },
  x04q06: { src: 'img/tests/x04q06.webp', w: 1776, h: 886 },
  x04q12: { src: 'img/tests/x04q12.webp', w: 1603, h: 656 },
  x04q13: { src: 'img/tests/x04q13.webp', w: 1920, h: 791 },
  x04q14: { src: 'img/tests/x04q14.webp', w: 1920, h: 649 },
  x04q15: { src: 'img/tests/x04q15.webp', w: 1920, h: 777 },
  x04q16: { src: 'img/tests/x04q16.webp', w: 1920, h: 809 },
  x04q17: { src: 'img/tests/x04q17.webp', w: 1080, h: 447 },
  x04q18: { src: 'img/tests/x04q18.webp', w: 1599, h: 656 },
  x04q19: { src: 'img/tests/x04q19.webp', w: 1080, h: 447 },
  x04q20: { src: 'img/tests/x04q20.webp', w: 1080, h: 447 },
  x05q01: { src: 'img/tests/x05q01.webp', w: 1920, h: 770 },
  x05q02: { src: 'img/tests/x05q02.webp', w: 1920, h: 780 },
  x05q03: { src: 'img/tests/x05q03.webp', w: 1920, h: 780 },
  x05q04: { src: 'img/tests/x05q04.webp', w: 1920, h: 785 },
  x05q05: { src: 'img/tests/x05q05.webp', w: 1920, h: 772 },
  x05q06: { src: 'img/tests/x05q06.webp', w: 1578, h: 656 },
  x05q07: { src: 'img/tests/x05q07.webp', w: 1920, h: 784 },
  x05q08: { src: 'img/tests/x05q08.webp', w: 1599, h: 656 },
  x05q09: { src: 'img/tests/x05q09.webp', w: 1920, h: 784 },
  x05q10: { src: 'img/tests/x05q10.webp', w: 1605, h: 656 },
  x05q11: { src: 'img/tests/x05q11.webp', w: 1920, h: 809 },
  x05q12: { src: 'img/tests/x05q12.webp', w: 1918, h: 820 },
  x05q13: { src: 'img/tests/x05q13.webp', w: 1648, h: 656 },
  x05q14: { src: 'img/tests/x05q14.webp', w: 1581, h: 656 },
  x05q15: { src: 'img/tests/x05q15.webp', w: 1920, h: 789 },
  x05q16: { src: 'img/tests/x05q16.webp', w: 1916, h: 821 },
  x05q17: { src: 'img/tests/x05q17.webp', w: 1916, h: 821 },
  x05q18: { src: 'img/tests/x05q18.webp', w: 1920, h: 811 },
  x05q19: { src: 'img/tests/x05q19.webp', w: 1914, h: 822 },
  x05q20: { src: 'img/tests/x05q20.webp', w: 1920, h: 811 },
  x07q01: { src: 'img/tests/x07q01.webp', w: 1774, h: 887 },
  x07q02: { src: 'img/tests/x07q02.webp', w: 1774, h: 887 },
  x07q03: { src: 'img/tests/x07q03.webp', w: 1621, h: 656 },
  x07q04: { src: 'img/tests/x07q04.webp', w: 1640, h: 656 },
  x07q05: { src: 'img/tests/x07q05.webp', w: 1920, h: 768 },
  x07q07: { src: 'img/tests/x07q07.webp', w: 1920, h: 787 },
  x07q08: { src: 'img/tests/x07q08.webp', w: 1920, h: 793 },
  x07q09: { src: 'img/tests/x07q09.webp', w: 1585, h: 656 },
  x07q10: { src: 'img/tests/x07q10.webp', w: 1920, h: 787 },
  x08q01: { src: 'img/tests/x08q01.webp', w: 1672, h: 941 },
  x08q05: { src: 'img/tests/x08q05.webp', w: 1596, h: 656 },
  x08q07: { src: 'img/tests/x08q07.webp', w: 1599, h: 656 },
  x08q09: { src: 'img/tests/x08q09.webp', w: 1599, h: 656 },
  x08q10: { src: 'img/tests/x08q10.webp', w: 1596, h: 656 },
  x09q01: { src: 'img/tests/x09q01.webp', w: 1596, h: 656 },
  x09q03: { src: 'img/tests/x09q03.webp', w: 1632, h: 656 },
  x09q06: { src: 'img/tests/x09q06.webp', w: 1603, h: 656 },
  x09q07: { src: 'img/tests/x09q07.webp', w: 1625, h: 656 },
  x09q08: { src: 'img/tests/x09q08.webp', w: 1599, h: 656 },
  x09q10: { src: 'img/tests/x09q10.webp', w: 1592, h: 656 },
  x10q01: { src: 'img/tests/x10q01.webp', w: 1640, h: 656 },
  x10q02: { src: 'img/tests/x10q02.webp', w: 1603, h: 656 },
  x10q03: { src: 'img/tests/x10q03.webp', w: 1599, h: 656 },
  x10q04: { src: 'img/tests/x10q04.webp', w: 1596, h: 656 },
  x10q05: { src: 'img/tests/x10q05.webp', w: 1596, h: 656 },
  x10q06: { src: 'img/tests/x10q06.webp', w: 1593, h: 656 },
  x10q19: { src: 'img/tests/x10q19.webp', w: 1630, h: 640 },
  x11q03: { src: 'img/tests/x11q03.webp', w: 1639, h: 656 },
  x11q09: { src: 'img/tests/x11q09.webp', w: 1774, h: 887 },
  x11q10: { src: 'img/tests/x11q10.webp', w: 1774, h: 887 },
  x11q11: { src: 'img/tests/x11q11.webp', w: 1636, h: 656 },
  x11q12: { src: 'img/tests/x11q12.webp', w: 1615, h: 640 },
  x11q13: { src: 'img/tests/x11q13.webp', w: 1610, h: 656 },
  x11q15: { src: 'img/tests/x11q15.webp', w: 1603, h: 656 },
  x11q16: { src: 'img/tests/x11q16.webp', w: 1585, h: 656 },
  x11q17: { src: 'img/tests/x11q17.webp', w: 1595, h: 672 },
  x13q01: { src: 'img/tests/x13q01.webp', w: 1614, h: 656 },
  x13q02: { src: 'img/tests/x13q02.webp', w: 1609, h: 656 },
};
/* Дохионы байрлал tools/lamp-editor-оор тохируулагдаж js/tests-lamps.js-д хадгалагдана; тэнд байгаа зургийн дохиог энд орлуулна (засварлагчийн код апп-д ороогүй). */
if (typeof TEST_LAMPS !== 'undefined') Object.keys(TEST_LAMPS).forEach(k => { if (TEST_PHOTO[k]) TEST_PHOTO[k].lamps = TEST_LAMPS[k]; });
var PHOTO_UID = 0; /* нэг хуудсанд олон зураг байдаг тул mask/clipPath id давхцахгүй байх тоолуур */
function photoArt(p) {
  /* Хуучин тестийн хэв: нарийн хар шугам, хар сумны толгой, дээр нь хар үсэг (уншигдахын тулд нимгэн цагаан хүрээтэй). */
  /* Сум замын гадаргуу дээр хэвтэж буй мэт: перспективээр (ойр бол том, хол бол жижиг), толгой нь гүнзгийн чиглэлд хавтгайрсан. */
  const arrow = (m, grow) => {
    const s = Math.max(.8, (m.y + 258) / 700), hl = Math.min(66 * s, (m.x2 - m.x1) * .3), hw = 12 * s, sh = 2.6 * s + grow;
    const sw = hw * 0 + sh;
    const tri = (x, d) => `M${x} ${m.y}L${x + d * hl} ${m.y - hw - grow}L${x + d * hl * .78} ${m.y}L${x + d * hl} ${m.y + hw + grow}Z`;
    return `<path d="M${m.x1 + hl * .7} ${m.y - sw}H${m.x2 - hl * .7}V${m.y + sw}H${m.x1 + hl * .7}Z${tri(m.x1, 1)}${tri(m.x2, -1)}" stroke-linejoin="round"/>`;
  };
  const marks = (p.marks || []).map(m => {
    const cx = (m.x1 + m.x2) / 2, s = (m.y + 258) / 700, fs = 42 + 14 * s;
    return `<g fill="#fff" stroke="#fff" stroke-width="${3 * s}" opacity=".5">${arrow(m, 1.6 * s)}</g>`
      + `<g fill="#0a0a0a">${arrow(m, 0)}</g>`
      + `<text x="${cx}" y="${m.below ? m.y + 20 * s + fs * .8 : m.y - 16 * s}" text-anchor="middle" font-family="Segoe UI,Roboto,Arial,sans-serif" font-weight="800" font-size="${fs}" fill="#0a0a0a" stroke="#fff" stroke-width="8" stroke-opacity=".85" paint-order="stroke" stroke-linejoin="round">${m.l}</text>`;
  }).join('');
  const lfs = Math.round(p.w / 26);
  /* ask: «?» амьсгалж (2.8с мөчлөг), сум нь «?»-ээс урсан очиж, үзүүр дээр нь долгион гарна. */
  const breathe = (m, fs, inner) => !p.ask ? inner
    : '<g transform="translate(' + m.x + ' ' + (m.y - fs * .35) + ')"><g><animateTransform attributeName="transform" type="scale" values="1;1.16;1;1.16;1;1" keyTimes="0;.12;.25;.37;.5;1" dur="2.8s" repeatCount="indefinite"/><g transform="translate(' + (-m.x) + ' ' + (-(m.y - fs * .35)) + ')">' + inner + '</g></g></g>';
  /* sound: {x, y, dx, dy, fs} — дуутай тусгай дохио: гурван ♪ нот (жижиг→том) мигалкаас цуварч гарч, (dx,dy) тийш хөвж бүдгэрнэ. Үсэг, «?»-тэй адил хар, цагаан контуртай. */
  const soundSvg = (p.sound ? [p.sound] : []).map(s => {
    const D = '3.2s', fs0 = s.fs || 44;
    /* waves: true — нотын оронд мигалкнаас тархах дууны долгион: улаан/цэнхэр цагираг ээлжлэн (R = эцсийн радиус, squash = перспектив). */
    /* arc: true — Wi-Fi хэлбэрийн дээш чиглэсэн 3 нум (жижиг→том), өнгө ээлжлэн дараалан асаж бүдгэрнэ. R = хамгийн том радиус, span = нумын өнцөг (°). */
    /* burst: true — хагас нарны цацраг шиг: ♪ нотууд мигалкны дээр хагас тойргоор цацарч, нот бүр улаан/цэнхэрээр ээлжлэн анивчина. n = нотын тоо, R = радиус, span = өнцөг (°), fs = нотын хэмжээ. */
    if (s.burst) {
      const R = s.R || 150, n = s.n || 7, span = (s.span || 150) * Math.PI / 180, f = s.fs || 40, cols = s.cols || ['#ff2a1a', '#2a62ff'], Wn = s.dur || 3.2, W = Wn + 's';
      /* Нот доод цэгээс (мигалкны төв) гарч, радиусаар хажуу тийш цацарч, бүдгэрнэ. Улаан/цэнхэр нот хагас мөчлөгөөр зөрж гарна. */
      return Array.from({ length: n }, (_, i) => {
        const a = Math.PI / 2 + span / 2 - span * i / (n - 1), ca = Math.cos(a), sa = Math.sin(a);
        const x0 = Math.round(s.x + R * .1 * ca), y0 = Math.round(s.y - R * .1 * sa), x1 = Math.round(s.x + R * ca), y1 = Math.round(s.y - R * sa);
        const bg = (i % 2 ? Wn / 2 : 0).toFixed(2) + 's';
        const an = (a2, v, kt) => `<animate attributeName="${a2}" values="${v}" keyTimes="${kt}" dur="${W}" begin="${bg}" repeatCount="indefinite"/>`;
        return `<text x="${x0}" y="${y0}" text-anchor="middle" dominant-baseline="central" font-family="Segoe UI Symbol,Segoe UI,Arial,sans-serif" font-weight="800" font-size="${f}" fill="${cols[i % 2]}" stroke="#fff" stroke-width="${f * .2}" paint-order="stroke" stroke-linejoin="round" opacity="0">${an('opacity', '0;1;1;0;0', '0;.12;.5;.8;1')}${an('x', x0 + ';' + x1 + ';' + x1, '0;.8;1')}${an('y', y0 + ';' + y1 + ';' + y1, '0;.8;1')}♪</text>`;
      }).join('');
    }
    if (s.arc) {
      const R = s.R || 150, sw = s.sw || 11, span = (s.span || 100) * Math.PI / 180, cols = s.cols || ['#ff2a1a', '#2a62ff'], W = '1.8s';
      const pt = (r, a) => [Math.round((s.x + r * Math.cos(a)) * 10) / 10, Math.round((s.y - r * Math.sin(a)) * 10) / 10];
      return [0, 1, 2].map(i => {
        const r = R * (0.38 + i * 0.31), a0 = Math.PI / 2 - span / 2, a1 = Math.PI / 2 + span / 2, A = pt(r, a0), B = pt(r, a1);
        const d = `M${A[0]} ${A[1]} A${r} ${r} 0 0 0 ${B[0]} ${B[1]}`, bg = (i * 0.28).toFixed(2) + 's', c = cols[i % 2];
        const op = `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.14;.5;.72;1" dur="${W}" begin="${bg}" repeatCount="indefinite"/>`;
        return `<path d="${d}" fill="none" stroke="#fff" stroke-width="${sw + 6}" stroke-linecap="round" opacity="0">${op}</path><path d="${d}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" opacity="0">${op}</path>`;
      }).join('');
    }
    if (s.waves) {
      const R = s.R || 170, sq = s.squash || .62, sw = s.sw || 10, cols = s.cols || ['#ff2a1a', '#2a62ff'];
      return [0, 1, 2, 3].map(i => {
        const bg = (i * 0.8).toFixed(2) + 's', c = cols[i % 2], W = '4.2s';
        const an = (a, v, kt) => `<animate attributeName="${a}" values="${v}" keyTimes="${kt || '0;1'}" dur="${W}" begin="${bg}" repeatCount="indefinite"/>`;
        const ring = (col, w, extra) => `<ellipse cx="${s.x}" cy="${s.y}" rx="${R * .08}" ry="${R * .08 * sq}" fill="none" stroke="${col}" stroke-width="${w}" opacity="0" ${extra || ''}>${an('rx', (R * .08) + ';' + R)}${an('ry', (R * .08 * sq) + ';' + (R * sq))}<animate attributeName="opacity" values="0;1;.85;0" keyTimes="0;.1;.65;1" dur="${W}" begin="${bg}" repeatCount="indefinite"/></ellipse>`;
        return ring('#fff', sw + 5) + ring(c, sw);
      }).join('');
    }
    return [0, 1, 2].map(i => {
      const f = fs0 * (0.75 + i * 0.45), x1 = s.x + s.dx * (0.55 + i * 0.3) * (i % 2 ? 1 : .9), y1 = s.y + s.dy * (0.55 + i * 0.3);
      const bg = (i * 0.55).toFixed(2) + 's';
      const an = (a, v) => `<animate attributeName="${a}" values="${v}" keyTimes="0;.5;1" dur="${D}" begin="${bg}" repeatCount="indefinite"/>`;
      const op = `<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.12;.4;.55;1" dur="${D}" begin="${bg}" repeatCount="indefinite"/>`;
      const ff = 'font-family="Segoe UI Symbol,Segoe UI,Arial,sans-serif" font-weight="800" font-size="' + f + '"';
      const xy = `${an('x', s.x + ';' + x1 + ';' + x1)}${an('y', s.y + ';' + y1 + ';' + y1)}${op}`;
      /* col: өнгөт нот (жишээ эмнэлгийн ногоон) — гадна цагаан, дотор хар хүрээтэй */
      return `<text x="${s.x}" y="${s.y}" text-anchor="middle" ${ff} fill="${s.col || '#0a0a0a'}" stroke="#fff" stroke-width="${f * .16}" paint-order="stroke" stroke-linejoin="round" opacity="0">${xy}♪</text>`;
    }).join('');
  }).join('');
  const labels = (p.labels || []).map(m => m.plain
    ? `<text x="${m.x}" y="${m.y}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="${m.fs || Math.round(lfs * .9)}" fill="#111">${m.l}</text>`
    : breathe(m, m.fs || lfs, `<text x="${m.x}" y="${m.y}" text-anchor="middle" font-family="Segoe UI,Roboto,Arial,sans-serif" font-weight="800" font-size="${m.fs || lfs}" fill="#0a0a0a" stroke="#fff" stroke-width="${(m.fs || lfs) * .16}" paint-order="stroke" stroke-linejoin="round">${m.l}</text>`)).join('');

  /* arrows: [{pts:[[x,y],...], w}] — AI зураг дээр дутсан хар сум (бүлэг 6). Цэгүүдийг гөлгөр муруйгаар холбож, төгсгөлд толгой тавина. */
  const arrowsSvg = (p.arrows || []).map(a => {
    const P = a.pts, w = a.w || 6, n = P.length, f = v => Math.round(v * 10) / 10;
    let d = 'M' + P[0][0] + ' ' + P[0][1];
    for (let i = 0; i < n - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + p2[0] + ' ' + p2[1];
    }
    const e = P[n - 1], q = P[n - 2], an = Math.atan2(e[1] - q[1], e[0] - q[0]), hl = w * 4.2, hw = w * 1.9, ca = Math.cos(an), sa = Math.sin(an);
    const tip = [e[0] + ca * hl * .55, e[1] + sa * hl * .55], bx = e[0] - ca * hl * .45, by = e[1] - sa * hl * .45;
    const head = 'M' + f(tip[0]) + ' ' + f(tip[1]) + 'L' + f(bx - sa * hw) + ' ' + f(by + ca * hw) + 'L' + f(bx + sa * hw) + ' ' + f(by - ca * hw) + 'Z';
    if (p.flow) {
      const rip = p.ask ? [0, .1].map(o => '<circle cx="' + f(tip[0]) + '" cy="' + f(tip[1]) + '" r="6" fill="none" stroke="#ffd400" stroke-linecap="butt" opacity="0">'
        + '<animate attributeName="r" values="6;6;42;42" keyTimes="0;' + (.5 + o) + ';' + (.74 + o) + ';1" dur="2.8s" repeatCount="indefinite"/>'
        + '<animate attributeName="stroke-width" values="6;6;2;2" keyTimes="0;' + (.5 + o) + ';' + (.74 + o) + ';1" dur="2.8s" repeatCount="indefinite"/>'
        + '<animate attributeName="opacity" values="0;0;.95;0;0" keyTimes="0;' + (.5 + o) + ';' + (.53 + o) + ';' + (.74 + o) + ';1" dur="2.8s" repeatCount="indefinite"/></circle>').join('') : '';
      /* flow: сум сүүлнээсээ толгой руугаа урсан зурагдаж, толгой нь төгсгөлд гарч, зогсоод бүдгэрнэ (давтана). */
      const D = '2.8s', sa = '<animate attributeName="stroke-dashoffset" values="101;0;0;0" keyTimes="0;.5;.9;1" dur="' + D + '" repeatCount="indefinite"/>';
      const ha = '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.46;.54;1" dur="' + D + '" repeatCount="indefinite"/>';
      const ga = '<animate attributeName="opacity" values="1;1;1;0;0" keyTimes="0;.8;.9;.97;1" dur="' + D + '" repeatCount="indefinite"/>';
      const dash = ' pathLength="100" stroke-dasharray="100 101" stroke-dashoffset="101"';
      return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">' + ga + '<path d="' + d + '" stroke="#fff" stroke-opacity=".55" stroke-width="' + (w + 3.5) + '"' + dash + '>' + sa + '</path><g>' + ha + '<path d="' + head + '" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-opacity=".55" stroke-width="3.5"/></g>'
        + '<path d="' + d + '" stroke="#0a0a0a" stroke-width="' + w + '"' + dash + '>' + sa + '</path><g>' + ha + '<path d="' + head + '" fill="#0a0a0a" stroke="#0a0a0a" stroke-width="1"/></g></g>' + rip;
    }
    return '<g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '" stroke="#fff" stroke-opacity=".55" stroke-width="' + (w + 3.5) + '"/><path d="' + head + '" fill="#fff" fill-opacity=".55" stroke="#fff" stroke-opacity=".55" stroke-width="3.5"/>'
      + '<path d="' + d + '" stroke="#0a0a0a" stroke-width="' + w + '"/><path d="' + head + '" fill="#0a0a0a" stroke="#0a0a0a" stroke-width="1"/></g>';
  }).join('');

  /* tapered: [{x, tip, base, bottom, hw, w0, w1}] — SS-ийн богино босоо хар сум: дээд тал нь гурвалжин толгойтой, шулуун иш доошоо өргөсөнө. */
  const taperedSvg = (p.tapered || []).map(t => {
    const i = 'tf' + (++PHOTO_UID);
    const pts = [[t.x, t.tip], [t.x + t.hw, t.base], [t.x + t.w1, t.base], [t.x + t.w0, t.bottom], [t.x - t.w0, t.bottom], [t.x - t.w1, t.base], [t.x - t.hw, t.base]].map(q => q.join(',')).join(' ');
    const poly = '<polygon points="' + pts + '" fill="#0a0a0a" stroke="#fff" stroke-opacity=".4" stroke-width="2" stroke-linejoin="round" paint-order="stroke"/>';
    if (!p.flow) return poly;
    /* flow: хайчлах тэгш өнцөгт доороос толгой руугаа өргөжиж, сум дээшээ урсана. */
    const D = '2.8s', top = t.tip - 4, H = t.bottom + 4 - top, kt = 'keyTimes="0;.5;.9;1" dur="' + D + '" repeatCount="indefinite"';
    return '<clipPath id="' + i + '"><rect x="' + (t.x - t.hw - 6) + '" y="' + (t.bottom + 4) + '" width="' + (2 * t.hw + 12) + '" height="0">'
      + '<animate attributeName="y" values="' + (t.bottom + 4) + ';' + top + ';' + top + ';' + top + '" ' + kt + '/>'
      + '<animate attributeName="height" values="0;' + H + ';' + H + ';' + H + '" ' + kt + '/></rect></clipPath>'
      + '<g clip-path="url(#' + i + ')"><animate attributeName="opacity" values="1;1;1;0;0" keyTimes="0;.8;.9;.97;1" dur="' + D + '" repeatCount="indefinite"/>' + poly + '</g>';
  }).join('');
  /* flowImg: [{src, x, y, w, h, path:[[x,y],...], sw}] — зурагт суусан сумыг (p.src-д сумгүй дэвсгэр, flowImg.src-д зөвхөн сум) төгсгөл рүү нь урсган нээнэ.
     x,y,w,h = сумын PNG-ийн байрлал; path = сүүлнээс толгой руу төвийн шугам; sw = нээх зураасны өргөн. */
  const flowImgSvg = [].concat(p.flowImg || []).map(f => {
    const D = '2.8s', d = 'M' + f.path.map(q => q.join(' ')).join('L'), i = 'fi' + (++PHOTO_UID);
    return '<mask id="' + i + '" maskUnits="userSpaceOnUse" x="0" y="0" width="' + p.w + '" height="' + p.h + '"><path d="' + d + '" fill="none" stroke="#fff" stroke-width="' + f.sw + '" stroke-linecap="round" stroke-linejoin="round" pathLength="100" stroke-dasharray="100 101" stroke-dashoffset="101">'
      + '<animate attributeName="stroke-dashoffset" values="101;0;0;0" keyTimes="0;.5;.9;1" dur="' + D + '" repeatCount="indefinite"/></path></mask>'
      + '<g mask="url(#' + i + ')"><animate attributeName="opacity" values="1;1;1;0;0" keyTimes="0;.8;.9;.97;1" dur="' + D + '" repeatCount="indefinite"/><image href="' + f.src + '" x="' + (f.x || 0) + '" y="' + (f.y || 0) + '" width="' + (f.w || p.w) + '" height="' + (f.h || p.h) + '"/></g>';
  }).join('');
  const blink = '<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;.5;.5;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/>';
  const blinkOff = '<animate attributeName="opacity" values="0;0;.72;.72" keyTimes="0;.5;.5;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/>';
  const blinkB = '<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;.5;.5;1" dur="1s" calcMode="discrete" repeatCount="indefinite"/>';
  /* Тусгай дохио (цагдаа, түргэн тусламж...): beam = {poly|rect, col, alt, glow}; alt=1 бол эсрэг фазд (улаан/цэнхэр ээлжлэн). */
  const beams = (p.beams || []).map(b => {
    const pts = b.poly || [[b.rect[0], b.rect[1]], [b.rect[2], b.rect[1]], [b.rect[2], b.rect[3]], [b.rect[0], b.rect[3]]];
    const c = pts.reduce((a, q) => [a[0] + q[0] / pts.length, a[1] + q[1] / pts.length], [0, 0]);
    const an = b.alt ? blinkB : blink, g = b.glow || 14;
    return `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${g * 2.2}" ry="${g * 1.3}" fill="${b.col}" opacity="1" filter="url(#blur6)" style="mix-blend-mode:screen">${an}</ellipse>`
      + `<polygon points="${pts.map(q => q.join(',')).join(' ')}" fill="${b.col}" opacity=".62" style="mix-blend-mode:screen">${an}</polygon>`
      + `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${g * .3}" ry="${g * .15}" fill="#ffffff" opacity=".55" filter="url(#blur2)">${an}</ellipse>`;
  }).join('');
  const lamps = (p.lamps || []).map(l => {
    if (l.white) {
      const r = Math.max(l.el[2], l.el[3]);
      return `<ellipse cx="${l.el[0]}" cy="${l.el[1]}" rx="${r * 3.4}" ry="${r * 3}" fill="url(#whBloom)" style="mix-blend-mode:screen"/>`
        + `<ellipse cx="${l.el[0]}" cy="${l.el[1]}" rx="${l.el[2]}" ry="${l.el[3]}" transform="rotate(${l.el[4] || 0} ${l.el[0]} ${l.el[1]})" fill="url(#whRad)" filter="url(#blurS)" style="mix-blend-mode:screen"/>`;
    }
    const c = l.poly ? l.poly.reduce((a, q) => [a[0] + q[0] / l.poly.length, a[1] + q[1] / l.poly.length], [0, 0]) : l.el;
    const shape = l.poly
      ? `<polygon points="${l.poly.map(q => q.join(',')).join(' ')}" fill="url(#ambLens)" style="mix-blend-mode:screen">${blink}</polygon>`
      : (l.soft
        ? `<ellipse cx="${l.el[0]}" cy="${l.el[1]}" rx="${l.el[2]}" ry="${l.el[3]}" transform="rotate(${l.el[4]} ${l.el[0]} ${l.el[1]})" fill="url(#ambRad)" opacity=".8" filter="url(#blurS)" style="mix-blend-mode:screen">${blink}</ellipse>`
        : `<ellipse cx="${l.el[0]}" cy="${l.el[1]}" rx="${l.el[2]}" ry="${l.el[3]}" transform="rotate(${l.el[4]} ${l.el[0]} ${l.el[1]})" fill="#ffb81f" style="mix-blend-mode:screen">${blink}</ellipse>`);
    const dim = l.dim ? `<ellipse cx="${l.el[0]}" cy="${l.el[1]}" rx="${l.el[2] * 1.15}" ry="${l.el[3] * 1.15}" transform="rotate(${l.el[4]} ${l.el[0]} ${l.el[1]})" fill="#3a1a06" opacity=".72" filter="url(#blur2)">${blinkOff}</ellipse>` : '';
    const bm = Math.max(l.el ? l.el[2] : 0, l.el ? l.el[3] : 0);
    const bloom = l.soft
      ? `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${bm * 3.3}" ry="${bm * 2.8}" fill="url(#ambBloom)" style="mix-blend-mode:screen">${blink}</ellipse>`
      : `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${l.glow}" ry="${l.glow * .8}" fill="#ffa800" opacity=".55" filter="url(#blur6)" style="mix-blend-mode:screen">${blink}</ellipse>`;
    return dim + bloom
      + shape
      + (l.soft ? `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${l.el[2] * .38}" ry="${l.el[3] * .34}" fill="#fffbe0" opacity=".95" filter="url(#blurS)">${blink}</ellipse>` : `<ellipse cx="${c[0]}" cy="${c[1]}" rx="${l.poly ? 4.5 : 1.6}" ry="${l.poly ? 3.2 : 1.4}" fill="#fff6d0" opacity=".75" filter="url(#blur2)">${blink}</ellipse>`);
  }).join('');
  const defs = '<defs><linearGradient id="ambLens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd34d"/><stop offset="1" stop-color="#ff8c00"/></linearGradient><radialGradient id="ambBloom"><stop offset="0" stop-color="#ffc044" stop-opacity="1"/><stop offset=".35" stop-color="#ffa51c" stop-opacity=".6"/><stop offset=".7" stop-color="#ff8f00" stop-opacity=".22"/><stop offset="1" stop-color="#ff8a00" stop-opacity="0"/></radialGradient><radialGradient id="whRad"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f4f7ff"/><stop offset="1" stop-color="#cfe0ff"/></radialGradient><radialGradient id="whBloom"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".4" stop-color="#e8f0ff" stop-opacity=".5"/><stop offset="1" stop-color="#dbe8ff" stop-opacity="0"/></radialGradient><radialGradient id="ambRad"><stop offset="0" stop-color="#fff0a8"/><stop offset=".5" stop-color="#ffc233"/><stop offset="1" stop-color="#ff8a00"/></radialGradient><filter id="blurS" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="blur6" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="6"/></filter><filter id="blur2" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.w} ${p.h}" class="tart" role="img">${defs}<image href="${p.src}" x="0" y="0" width="${p.w}" height="${p.h}"/>${(p.marks || []).length ? marks : ''}${lamps}${beams}${flowImgSvg}${arrowsSvg}${taperedSvg}${labels}${soundSvg}</svg>`;
}




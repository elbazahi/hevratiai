
import { Exam } from './types';

export const INITIAL_EXAMS: Exam[] = [
  { id: 1, subject: 'מבוא לאכיפת חוק', lecturer: 'ד"ר נילי כהן', email: 'Nillysc@gmail.com', phone: '0507888764', date: '03/02/2026', link: "https://1drv.ms/w/c/1122f8b51af83346/IQCAVdX30jQQSbgY1VdAx-EQAXD6Y8XPbL4ffwRaLPfoJwc?e=lnhKtF", adminNote: "המבוא בנוי מ-33 שאלות אמריקאיות.\n\nזה כלל הנושאים לבחינה כולל הורדת חומר של המיקוד.\nמה שמודגש מסומן בצהוב ואדום זה חשוב מאוד.\nמה שבצבע טורקיז אלו תוספות מהשיעור של המרצה.", link2: "https://1drv.ms/w/c/1122f8b51af83346/IQDyXYrzb9vaSbQgXI3r3AMpAW34y1gAmEw67FISk6HFl0k?e=T8rVZ9", note2: "סיכום ממוקד (30 עמודים).", status: 'archive' },
  { id: 2, subject: 'עבריינות והערכת מסוכנות', lecturer: 'ד"ר מוכתר עופר', email: 'ofermu2@gmail.com', date: '10/02/2026', link: "https://1drv.ms/b/c/1122f8b51af83346/IQA_oXSkEGNPQJKQJDOBiwDUAa67mW8gFCKIp5L-VGorjSM?e=y7fong", linkTitle: "תמלול מצגות 📄", adminNote: "קובץ תמלול מצגות מכיל כ-30 עמודים של המצגות מילה במילה.\n\nנוסף קובץ איסוף הכולל את כל המצגות של הקורס מחובר!\n\nנוספו 100 שאלות תרגול למבחן!", status: 'archive', completedAt: 1739184000000 },
  { id: 3, subject: 'משטרה וחברה 💻', lecturer: 'ד"ר אירית', email: 'airitklb1@edu.aac.ac.il', date: '17/02/2026', link: 'https://drive.google.com/file/d/117HIvFY_tEx_TIxp6Gyc3qwZquAXouNX/view?usp=sharing', linkTitle: 'איסוף חומר', adminNote: "זה סיכום הגדרות קצר תורידו ותוסיפו מה שנראה לכם שחסר.\n\nקובץ של 9 קבצים של חומר הלימוד מאוגדים יחד.", status: 'archive', completedAt: Date.now() },
  { id: 4, subject: 'בתי סוהר', lecturer: 'ד"ר מוכתר עופר', email: 'ofermu2@gmail.com', date: '24/02/2026', link: '#', adminNote: "מבחן משולב!!\nסגור : 15 שאלות חובה\nפתוח : 8 מתוך 10\nהעלתי לכם קובץ מאוחד של כלל המצגות", status: 'active' },
  { id: 5, subject: 'מבוא למשפט עברי 💻', lecturer: 'ד"ר בן פזי', email: 'benpazis@walla.co.il', date: '05/03/2026', link: '#', adminNote: "דגש על סוגיות צדק חברתי.", status: 'active' },
  { id: 6, subject: 'ספרות מקראית מטלה 4 📝', lecturer: 'ד"ר עמיחי נחשון', email: 'amicincs@edu.aac.ac.il', phone: '0524332819', date: '15/03/2026', link: "https://1drv.ms/w/c/1122f8b51af83346/IQDvz5oFROQwTrt5_e-Pyup1AaUSGdTSOhjFNeU2Q15yi6k?e=b9JFoZ", adminNote: "מטלה 4 - מומלץ להיעזר בכלי AI.", status: 'active' }
];

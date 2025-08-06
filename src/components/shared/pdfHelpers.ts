import { jsPDF } from "jspdf";

export const addWatermark = (doc: jsPDF) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  doc.saveGraphicsState();

  try {
    const img = new Image();
    img.src = '/logo.png';
    
    const imgWidth = 100;
    const imgHeight = 50;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    doc.setGState( doc.GState({ opacity: 0.1 })); 
    doc.addImage(img, 'PNG', x, y, imgWidth, imgHeight);
  } catch (error) {
    console.error('Error adding watermark:', error);
  }

  doc.restoreGraphicsState();
};

export const processMathForPDF = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') 
    .replace(/\*(.*?)\*/g, '$1')     
    .replace(/#{1,6}\s/g, '')        
    .replace(/\$\$(.*?)\$\$/g, '$1')
    .replace(/\$(.*?)\$/g, '$1')
    .replace(/\\frac{(.*?)}{(.*?)}/g, '$1/$2')
    .replace(/\\sqrt{(.*?)}/g, '√($1)')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\cdot/g, '·')
   
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\text{(.*?)}/g, '$1')
    .replace(/\\begin{.*?}|\\end{.*?}/g, '')
    .replace(/\\[a-zA-Z]+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatPDFText = (doc: jsPDF, text: string, isTitle: boolean = false) => {
  if (isTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
  }
  
  return doc.splitTextToSize(processMathForPDF(text), 170);
};

export const willContentFitOnPage = (doc: jsPDF, contentHeight: number, currentY: number) => {
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;
  return (currentY + contentHeight) < (pageHeight - marginBottom);
};

export const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(
    "Generated from https://pilox.com.ng",
    doc.internal.pageSize.width / 2,
    pageHeight - 10,
    { align: "center" }
  );
  doc.setTextColor(0, 0, 0);
}; 
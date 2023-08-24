const generateSlug = (text: string): string => {
    return text
      .toLowerCase() 
      .replace(/[^a-zA-Z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 10);
}

export default generateSlug;
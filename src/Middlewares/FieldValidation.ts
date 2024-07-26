export function idValidation(id: string): boolean {
    return (id ? true: false);
}

export function nameValidation(name: string): boolean {
    return (name ? true : false);
}

export function phoneValidation(phone: string): boolean {
    const regex = /^\d{10}$/;
    return regex.test(phone);
}

export function emailValidation(email: string): boolean {
    const regex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}



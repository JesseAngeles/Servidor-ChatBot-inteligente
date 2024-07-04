export function phoneValidation(phone:string) {
    const regex = /^\d{10}$/;
    return regex.test(phone);
}
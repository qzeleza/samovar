//
// Класс FormDataValidator предназначен для проверки данных в формах
//
class FormDataValidator {
    constructor(formId) {

        this.fields = [{}];
        this.formId = formId;
        const self = this;
        $('#' + formId + ' [data-bs-toggle="tooltip"]').each((index, element) => {
            new bootstrap.Tooltip(element);
        });

    }

    // Функция для проверки валидности email
    isEmailValid(email) {
        let result = {'error': false, 'description': ''};
        // Регулярное выражение для проверки email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            result['error'] = true;
            result['description'] = 'Введите корректный email в поле "Email".';
        }
        return result;
    }

    isTextValid(text, minLength) {
        let result = {'error': false, 'description': ''};
        if (text.length < minLength) {
            result['error'] = true;
            result['description'] = `Поле должно содержать не менее ${minLength} символов..`
        }
        return result;
    }

    _validateField(field, dictResult) {

        if (dictResult['error']) {
            field.addClass('is-invalid');
            field.tooltip({
                title: dictResult['description'],
                trigger: 'manual',
                placement: field.attr('data-bs-placement')
            }).tooltip('show');

            return false;
        }

        field.removeClass('is-invalid');
        field.tooltip('dispose');
        return true;
    }

    validate() {

        const self = this;
        let isValid = true;

        $('#' + this.formId + ' input[type="text"], input[type="email"], textarea').each((index, element) => {

            const $element = $(element); // Преобразование элемента в объект jQuery
            const elementValue = $element.val();
            let result = null;
            const minLength = $element.attr('data-min-length');
            const email = $element.attr('data-validate-email');

            if (minLength) result = self.isTextValid(elementValue, minLength);
            if (email) result = self.isEmailValid(elementValue);

            isValid &&= self._validateField($element, result);

            }
        );
        return isValid;
    }
}
// export default FormDataValidator;
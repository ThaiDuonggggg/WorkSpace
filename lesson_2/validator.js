
function Validator(formSelector) {
    // Gán giá trị mặc định cho tham số (ES5)
    var _this = this;
    var formRules ={};


    function getParent(element, selector) {
        while(element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }


    var validatorRules =  {
        required: (value) => {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: (value) => {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        },
        min: (min) => {
            return (value) => {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`
            }
        },
        max: (max) => {
            return (value) => {
                return value.length <= max ? undefined : `Chỉ được nhập tối đa ${max} ký tự`
            }
        },        
    };

    

    // Get form
    var formElement = document.querySelector(formSelector);
    if (formElement) {
        // Get input name & rules
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(var input of inputs) {
            var rules = input.getAttribute('rules').split('|');

            for(var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                var ruleInfo;

                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }

                var ruleFunc = validatorRules[rule];

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }

               if (Array.isArray(formRules[input.name])) {
                formRules[input.name].push(ruleFunc);
               } else {
                formRules[input.name] = [ruleFunc];
               }
            }
            // Viết hàm xử lý sự kiện 
            input.onblur = handleValidate;
            input.oninput = handleClearError;

            function handleValidate(event) {
                var rules = formRules[event.target.name];
                var errorMesasge;

                for(var rule of rules) {
                    errorMesasge = rule(event.target.value);
                    if(errorMesasge) break;
                }
                
                // Từ errorMessage đi lấy thẻ cha và từ từ thẻ cha đi lấy thẻ
                // form-message

                if (errorMesasge) {
                    var formGroup = getParent(event.target, '.form-group');
                    if (formGroup) {
                       var formMessage = formGroup.querySelector('.form-message');
                       if (formMessage) {
                            formMessage.innerText = errorMesasge;
                            formGroup.classList.add('invalid');
                       };
                    }
                }
                return !errorMesasge;
            }

            function handleClearError(event) {
                var formGroup = getParent(event.target, '.form-group');
                if (formGroup.classList.contains('invalid')) {
                    formGroup.classList.remove('invalid');     

                    var formMessage = formGroup.querySelector('.form-message'); 
                    if (formMessage) {
                        formMessage.innerText = '';                
                    }
                }
            }
        }

        // Xử lý hành vi submit form
        formElement.onsubmit = function (event) {
            event.preventDefault();
            
            var inputs = formElement.querySelectorAll('[name][rules]');
            var isValid = true;

            for(input of inputs) {
                if (!handleValidate({ target : input })) {
                    isValid = false;
                }
            }
            
            // Khi không có lỗi thì submit form
            if (isValid) {
                if (typeof _this.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                values[input.name] = formElement.querySelector('input[name ="' + input.name + '"]:checked').value;
                                break;                       
                            default:
                                values[input.name] = input.value;
                        }
                        return  values;
                    }, {});
                    // Gọi lại hàm onSubmit và trả về giá trị của form
                    _this.onSubmit(formValues);
                } else {
                    formElement.submit();
                }
            }
        }
    }
}
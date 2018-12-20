import 'requirejs';
export class Test {
    success: boolean
    constructor(success?: boolean){
        this.success = typeof success === 'undefined' ? success : false;
    }
}

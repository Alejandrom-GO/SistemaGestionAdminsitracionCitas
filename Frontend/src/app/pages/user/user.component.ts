import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from './../user/services/users.service';
import { AuthService } from './../auth/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import Swal from 'sweetalert2';

const helper = new JwtHelperService();
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userRole = JSON.parse(localStorage.getItem('user'));
  private destroy$ = new Subject<any>();
  data: any ;
  mydates: any = [];
  user: any;
  descrypt: any ;
  searchForm = this.fb.group({
    matricula: ['', [Validators.required, Validators.minLength(6)]]
  });
  newForm = this.fb.group({
    mat: ['', [ Validators.minLength(5), Validators.maxLength(5)]],
    asunto: ['', [Validators.required, Validators.minLength(5)]],
    descripcion: ['', [Validators.required, Validators.minLength(5)]],
    fecha: [[Validators.required, Validators.minLength(5)]],
    forario: ['', [Validators.required, Validators.minLength(5)]],
    area: ['', [Validators.required, Validators.minLength(5)]],
    estado: ['pendiente', [Validators.required, Validators.minLength(5)]],
  });
  constructor(
    public authService: AuthService,
    private userService: UsersService,
    private router: Router,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    // tslint:disable-next-line:no-unused-expression
    const onUser = this.authService.isUser$;
    this.descrypt = helper.decodeToken(onUser.token);
    this.userService.getAll().subscribe(res => {
      this.data = res;
      for (const cita of this.data) {
        if (cita.mat === this.descrypt.uN) {
          this.mydates.push(cita);
        }
      }
    });
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    this.destroy$.next({});
    this.destroy$.complete();
  }

  onReset(): void {
    location.reload();
  }

  onSave(): void {
    if (this.newForm.invalid) {
      Swal.fire({
        icon: 'info',
        title: 'Verifica tus datos',
        confirmButtonText: 'OK'
      });
      return;
    }
    try {
      const formValue = this.newForm.value;
      formValue.mat = this.descrypt.uN;
      this.userService.new(formValue).subscribe((res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Cita Exitosa',
          text: 'Se ha agendado la cita correctamente'
        }).then((result) => {
          if (result.isConfirmed) {
            this.onReset();
          }
        });
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Hubo un error, intente nuevamente',
      });
    }
  }
  onLogout(): void {
    this.authService.logout();
  }
  // tslint:disable-next-line:typedef
  getErrorMessage(field: string) {
    let message;
    if (this.newForm.get(field).errors.required) {
      message = "El campo es requerido";
    } else if (this.newForm.get(field).hasError('minlength')) {
      message = 'El minimo de caracteres es 6';
    }
    return message;
  }
  // tslint:disable-next-line:typedef
  isValidate(field: string) {
    return (this.newForm.get(field).touched || this.newForm.get(field).dirty) &&
      !this.newForm.get(field).valid;
  }
  
  deleteDate(id: number): any {
    if (Swal.fire({
      title: '¿Estás seguro de eliminar esta cita?',
      text: "Si eliminas esta cita, no podras recuperarla más tarde",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService
          .delete(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            Swal.fire({
              icon: 'success',
              title: 'Cita eliminada con éxito',
            }).then((result) => {
              if (result.isConfirmed) {
                this.onReset();
              }
            });
            this.userService.getAll().subscribe((user) => {
              user.sort();
              user.reverse();
              this.data = user;
            });
          });
      }
    })) 
    {
    }
  }
}

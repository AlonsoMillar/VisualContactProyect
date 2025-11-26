import { Component, OnInit } from '@angular/core';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { DatabaseService, User } from '../../service/database.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Router } from '@angular/router';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: false
})
export class ConfigPage implements OnInit {

  user: User = { id: 0, name: '', email: '', password: '', phone: '', photo: '' };
  avatarScale = 1;
  showAvatarPreview = false;
  avatarPreviewUrl = '';
  private avatarPressTimer: any;

  showPasswordOverlay = false;
  revealedPassword = '';
  countdown = 15;

  constructor(
    private dbService: DatabaseService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
    private faio: FingerprintAIO,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    await this.dbService.initDB();
    await this.dbService.loadActiveUser();
    const current = this.dbService.currentUser$.value;
    if (current) this.user = { ...current };
  }

  // -----------------------------------
  // NUEVO BOTÓN → Va a un 404 falso
  // -----------------------------------
  goToFake() {
    this.router.navigateByUrl('/pagina-que-no-existe-404');
  }

  // -----------------------------
  // FUNCIONES EXISTENTES
  // -----------------------------
  get welcomeMessage(): string {
    return this.user.name ? `Bienvenido ${this.user.name}` : 'Bienvenido';
  }

  async changeAvatar() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto de perfil',
      buttons: [
        { text: 'Subir foto', icon: 'image-outline', handler: () => this.takePhoto(CameraSource.Photos) },
        { text: 'Sacar foto', icon: 'camera-outline', handler: () => this.takePhoto(CameraSource.Camera) },
        { text: 'Eliminar foto', icon: 'trash-outline', handler: async () => { 
          this.user.photo = ''; 
          await this.dbService.updateUser({ ...this.user }); 
        }},
        { text: 'Cancelar', icon: 'close-outline', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  private async takePhoto(source: CameraSource) {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source,
        quality: 90
      });

      if (photo.dataUrl) {
        this.user.photo = photo.dataUrl;
        await this.dbService.updateUser({ ...this.user });
      }
    } catch (err) {
      console.error('Error al tomar/subir foto:', err);
    }
  }

  onAvatarPressStart() {
    this.avatarPressTimer = setTimeout(() => {
      if (this.user.photo) {
        this.avatarPreviewUrl = this.user.photo;
        this.showAvatarPreview = true;
      }
    }, 500);
  }

  onAvatarPressEnd() {
    clearTimeout(this.avatarPressTimer);
  }

  closeAvatarPreview() {
    this.showAvatarPreview = false;
  }

  async editProfile() {
    const alert = await this.alertCtrl.create({
      header: 'Editar perfil',
      inputs: [
        { name: 'name', type: 'text', value: this.user.name, placeholder: 'Nombre' },
        { name: 'email', type: 'email', value: this.user.email, placeholder: 'Correo' },
        { name: 'phone', type: 'tel', value: this.user.phone, placeholder: 'Número' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.name || !data.email || !data.phone) return false;

            this.user.name = data.name.trim();
            this.user.email = data.email.trim();
            this.user.phone = data.phone.trim();

            await this.dbService.updateUser({ ...this.user });

            this.showToast('Perfil actualizado', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async changePassword() {
    const alert = await this.alertCtrl.create({
      header: 'Cambiar contraseña',
      inputs: [
        { name: 'oldPass', type: 'password', placeholder: 'Contraseña actual' },
        { name: 'newPass', type: 'password', placeholder: 'Nueva contraseña' },
        { name: 'confirmPass', type: 'password', placeholder: 'Confirmar contraseña' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.newPass !== data.confirmPass) {
              this.showToast('Las contraseñas no coinciden', 'danger');
              return false;
            }

            if (data.oldPass !== this.user.password) {
              this.showToast('Contraseña actual incorrecta', 'danger');
              return false;
            }

            const passwordRegex =
              /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*.,;:_\-])[A-Za-z\d!@#$%^&*.,;:_\-]{8,}$/;

            if (!passwordRegex.test(data.newPass)) {
              this.showToast(
                'La nueva contraseña debe tener mínimo 1 mayúscula, 1 número, 1 carácter especial y al menos 8 caracteres.',
                'warning'
              );
              return false;
            }

            this.user.password = data.newPass;
            await this.dbService.updateUser({ ...this.user });

            this.showToast('Contraseña actualizada', 'success');
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async showPassword() {
    try {
      await this.faio.show({
        title: 'Autenticación requerida',
        subtitle: 'Ver contraseña',
        description: 'Usa tu huella para ver la contraseña',
        cancelButtonTitle: 'Cancelar',
        disableBackup: true
      });

      this.revealedPassword = this.user.password;
      this.showPasswordOverlay = true;
      this.countdown = 15;

      const interval = setInterval(() => {
        this.countdown--;

        if (this.countdown <= 0) {
          clearInterval(interval);
          this.showPasswordOverlay = false;
        }
      }, 1000);
    } catch (err) {
      this.showToast('Autenticación fallida', 'danger');
      console.error('Error autenticación biométrica:', err);
    }
  }

  private async showToast(msg: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color
    });

    t.present();
  }

  async logout() {
    this.dbService.logoutSession();
    this.router.navigate(['/login']);
  }
}

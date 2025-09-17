import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as CryptoJS from 'crypto-js';

export interface UserDto {
  document: string;
  name: string;
  email: string;
  dateOfBirth: string;
  history: string;
  dateOfConversion: string;
}

@Injectable()
export class UserService {
  SECRET_KEY = process.env.SECRET_KEY || 'mi-clave-secreta-super-segura';
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getUsers(userRole?: string): Promise<User[]> {
    console.log('get users');
    const users = await this.userModel.find().exec();

    if (userRole === 'manager') {
      return users.map((user) => ({
        ...user.toObject(),
        history: this.decryptData(user.history, this.SECRET_KEY),
      }));
    }

    return users;
  }

  async createUpdateUser(user: UserDto): Promise<any> {
    const userExist = await this.userModel
      .findOne({ document: user.document })
      .exec();
    const privateInformation = this.encryptData(user.history, this.SECRET_KEY);
    if (userExist) {
      user.history = privateInformation;
      return this.userModel
        .findOneAndUpdate({ document: user.document }, user, { new: true })
        .exec();
    } else {
      user.history = privateInformation;
      const newUser = new this.userModel(user);
      return newUser.save();
    }
  }
  getUserByDocument(document: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ document }).exec();
  }

  encryptData(data: string, secretKey: string): string {
    try {
      console.log(data);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return CryptoJS.AES.encrypt(data, secretKey).toString();
    } catch (err) {
      console.warn(err);
      throw new InternalServerErrorException('Error encrypting data');
    }
  }

  decryptData(encryptedData: string, secretKey: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}

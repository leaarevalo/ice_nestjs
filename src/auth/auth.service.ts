/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Manager, ManagerDocument } from './schemas/manager.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Manager.name) private managerModel: Model<ManagerDocument>,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.managerModel.findOne({ email: username });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!user || !bcrypt.compareSync(pass, user.password)) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async register(username: string, pass: string, role?: string) {
    // hash password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const salt = bcrypt.genSaltSync(10);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(pass, salt);
    const newUser = new this.managerModel({
      email: username,
      password: hashedPassword,
      role: role || 'user',
    });
    await newUser.save();
  }
}

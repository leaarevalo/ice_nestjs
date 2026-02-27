import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { History } from './schemas/history.schema';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class HistoryService {
    private readonly SECRET_KEY: string;

    constructor(
        @InjectModel(History.name) private historyModel: Model<History>,
        private configService: ConfigService,
    ) {
        this.SECRET_KEY = this.configService.get<string>('SECRET_KEY');
    }

    async create(dto: CreateHistoryDto, managerId: string) {
        const encrypted = this.encryptData(dto.content, this.SECRET_KEY);
        const newHistory = new this.historyModel({
            userId: dto.userId,
            managerId,
            content: encrypted,
        });
        return newHistory.save();
    }

    async findByUserId(userId: string, managerId: string) {
        const records = await this.historyModel
            .find({ userId, managerId })
            .exec();
        return records.map((record) => ({
            ...record.toObject(),
            content: this.decryptData(record.content, this.SECRET_KEY),
        }));
    }

    async findByManagerId(managerId: string) {
        const records = await this.historyModel.find({ managerId }).exec();
        return records.map((record) => ({
            ...record.toObject(),
            content: this.decryptData(record.content, this.SECRET_KEY),
        }));
    }

    async findOne(id: string, managerId: string) {
        const record = await this.historyModel
            .findOne({ _id: id, managerId })
            .exec();
        if (!record) {
            throw new NotFoundException('Registro de historial no encontrado');
        }
        return {
            ...record.toObject(),
            content: this.decryptData(record.content, this.SECRET_KEY),
        };
    }

    async update(id: string, dto: UpdateHistoryDto) {
        if (dto.content) {
            dto.content = this.encryptData(dto.content, this.SECRET_KEY);
        }

        const record = await this.historyModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();

        if (!record) {
            throw new NotFoundException('Registro de historial no encontrado');
        }
        return record;
    }

    async delete(id: string) {
        const record = await this.historyModel.findByIdAndDelete(id).exec();
        if (!record) {
            throw new NotFoundException('Registro de historial no encontrado');
        }
        return { message: 'Registro de historial eliminado correctamente' };
    }

    private encryptData(data: string, secretKey: string): string {
        try {
            return CryptoJS.AES.encrypt(data, secretKey).toString();
        } catch (err) {
            console.warn(err);
            throw new InternalServerErrorException('Error encrypting data');
        }
    }

    private decryptData(encryptedData: string, secretKey: string): string {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

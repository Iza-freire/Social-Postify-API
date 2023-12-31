import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-ser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

    constructor(private readonly userRepository: UserRepository) { }

    async create(userDTO: CreateUserDto) {
        const existingUser = await this.userRepository.getByEmail(userDTO.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(userDTO.password, 10);
        const user = await this.userRepository.create({
            ...userDTO,
            password: hashedPassword,
        });
        return user;
    }

    async get(id: number) {
        const user = await this.userRepository.get(id);
        if (!user) throw new NotFoundException();
        return user;
    }

    async getByEmail(email: string) {
        const user = await this.userRepository.getByEmail(email);
        return user;
    }

    async delete(loggedUserId: number, id: number) {
        if (loggedUserId !== id) {
            throw new UnauthorizedException('You do not have permission to delete this user');
        }

        const user = await this.userRepository.get(id);
        if (!user) throw new NotFoundException();

        return this.userRepository.delete(id);
    }

    async update(loggedUserId: number, id: number, userDTO: CreateUserDto) {
        if (loggedUserId !== id) {
            throw new UnauthorizedException('You do not have permission to update this user');
        }

        const user = await this.userRepository.get(id);
        if (!user) throw new NotFoundException();

        const updatedUser = { ...user, ...userDTO };
        return this.userRepository.update(id, updatedUser);
    }
}

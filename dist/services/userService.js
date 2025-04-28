import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { BadRequestError, UnauthorizedError } from "../helpers/api-erros";
import { generateRandomPassword } from "../utils/generateRandomPassword";
import { sendEmail } from "./emailService";
import { emailTemplate } from "../utils/emailTemplate";
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS, validatePassword, } from "../utils/validators";
export const usersService = {
    async registerUser(body) {
        if (!PASSWORD_REGEX.test(body.password)) {
            throw new BadRequestError(PASSWORD_REQUIREMENTS);
        }
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email },
        });
        if (existingUser) {
            throw new BadRequestError("E-mail já registrado.");
        }
        const existingCpf = await prisma.user.findUnique({
            where: { cpf: body.cpf },
        });
        if (existingCpf) {
            throw new BadRequestError("CPF já registrado.");
        }
        if (body.userType === "business") {
            if (!body.companyName || !body.cnpj || !body.positionCompany) {
                throw new BadRequestError("Campos companyName, cnpj e positionCompany são obrigatórios para usuários do tipo 'business'.");
            }
            const existingCompany = await prisma.company.findUnique({
                where: { cnpj: body.cnpj },
            });
            if (existingCompany) {
                throw new BadRequestError("Empresa já cadastrada com este CNPJ.");
            }
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const userData = {
            name: body.name,
            email: body.email,
            phone: body.phone,
            password_hash: hashedPassword,
            cpf: body.cpf,
            user_type: body.userType,
        };
        const newUser = await prisma.user.create({ data: userData });
        let newCompany = null;
        if (body.userType === "person") {
            newCompany = await prisma.company.create({
                data: {
                    company_name: body.name,
                    cnpj: null,
                    position_company: null,
                    subscription_plan: "free",
                    owner_id: newUser.id,
                },
            });
            await prisma.company_user.create({
                data: {
                    user_id: newUser.id,
                    company_id: newCompany.id,
                    role: "admin",
                },
            });
        }
        if (body.userType === "business") {
            newCompany = await prisma.company.create({
                data: {
                    company_name: body.companyName ?? body.name,
                    cnpj: body.cnpj,
                    position_company: body.positionCompany,
                    subscription_plan: body.subscriptionPlan,
                    owner_id: newUser.id,
                },
            });
            await prisma.company_user.create({
                data: {
                    user_id: newUser.id,
                    company_id: newCompany.id,
                    role: "admin",
                },
            });
        }
        return {
            id: newUser.id,
            name: newUser.name,
            phone: newUser.phone,
            email: newUser.email,
            cpf: newUser.cpf,
            userType: newUser.user_type,
            company: newCompany
                ? {
                    id: newCompany.id,
                    companyName: newCompany.company_name,
                    positionCompany: newCompany.position_company,
                    cnpj: newCompany.cnpj,
                    subscriptionPlan: newCompany.subscription_plan,
                }
                : null,
        };
    },
    async getAllUsers(companyId) {
        const users = await prisma.user.findMany({
            include: {
                company_user: {
                    include: {
                        company: true,
                    },
                    ...(companyId && { where: { company_id: companyId } }),
                },
            },
            ...(companyId && {
                where: {
                    company_user: {
                        some: { company_id: companyId },
                    },
                },
            }),
        });
        return users.map((user) => {
            const userResponse = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                userType: user.user_type,
                cpf: user.cpf,
                companies: user.company_user.map((companyUser) => ({
                    id: companyUser.company.id,
                    companyName: companyUser.company.company_name,
                    cnpj: companyUser.company.cnpj ?? undefined,
                    positionCompany: companyUser.company.position_company ?? undefined,
                    subscriptionPlan: companyUser.company.subscription_plan,
                    role: companyUser.role,
                })),
            };
            return userResponse;
        });
    },
    async getUserById(id) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                company_user: {
                    include: {
                        company: true,
                    },
                },
            },
        });
        if (!user) {
            throw new BadRequestError("Usuário não encontrado.");
        }
        const userResponse = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            userType: user.user_type,
            cpf: user.cpf,
            companies: user.company_user.map((companyUser) => ({
                id: companyUser.company.id,
                companyName: companyUser.company.company_name,
                cnpj: companyUser.company.cnpj ?? undefined,
                positionCompany: companyUser.company.position_company ?? undefined,
                subscriptionPlan: companyUser.company.subscription_plan,
                role: companyUser.role, // Inclua o papel do usuário na empresa, se necessário
            })),
        };
        return userResponse;
    },
    async updateUser(id, body) {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new BadRequestError("Usuário não encontrado");
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: body.name ?? undefined,
                phone: body.phone ?? undefined,
            },
        });
        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            userType: updatedUser.user_type,
            cpf: updatedUser.cpf,
        };
    },
    async addUserToCompany(body) {
        const { email, companyId, role, name, phone, cpf, userType, userId } = body;
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company) {
            throw new BadRequestError("Empresa não encontrada.");
        }
        const requester = await prisma.company_user.findFirst({
            where: {
                user_id: userId,
                company_id: companyId,
                role: "admin",
            },
        });
        if (!requester) {
            throw new UnauthorizedError("Apenas administradores podem adicionar usuários a esta empresa.");
        }
        let user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            if (!name || !phone || !cpf || !userType) {
                throw new BadRequestError("Para cadastrar um novo usuário, os campos name, phone, cpf e userType são obrigatórios.");
            }
            const randomPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await prisma.user.create({
                data: {
                    email,
                    password_hash: hashedPassword,
                    name,
                    phone,
                    cpf,
                    user_type: userType,
                },
            });
            await sendEmail(email, "Bem-vindo ao Obra Fácil - Você foi adicionado a uma empresa", emailTemplate(company.company_name, randomPassword));
        }
        const existingCompanyUser = await prisma.company_user.findFirst({
            where: {
                user_id: user.id,
                company_id: companyId,
            },
        });
        if (existingCompanyUser) {
            throw new BadRequestError("Usuário já está associado a esta empresa.");
        }
        await prisma.company_user.create({
            data: {
                user_id: user.id,
                company_id: companyId,
                role: role,
            },
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                cpf: user.cpf,
                userType: user.user_type,
            },
            company: {
                id: company.id,
                companyName: company.company_name,
                cnpj: company.cnpj ?? undefined,
                positionCompany: company.position_company ?? undefined,
                subscriptionPlan: company.subscription_plan,
            },
            role,
        };
    },
    async changePassword(userId, currentPassword, newPassword) {
        if (currentPassword === newPassword) {
            throw new BadRequestError("A nova senha deve ser diferente da atual");
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password_hash: true },
        });
        if (!user) {
            throw new BadRequestError("Usuário não encontrado");
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!passwordMatch) {
            throw new BadRequestError("Senha atual incorreta");
        }
        if (newPassword.length < 6) {
            throw new BadRequestError("A nova senha deve ter pelo menos 6 caracteres");
        }
        if (!validatePassword(newPassword)) {
            throw new BadRequestError("A senha deve conter pelo menos 6 caracteres, incluindo maiúsculas, minúsculas e caracteres especiais");
        }
        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: newPasswordHash },
        });
        return { success: true };
    },
};

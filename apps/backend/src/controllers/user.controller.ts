// apps/backend/src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { ENSService } from '../services/ens.service';
import { FilecoinService } from '../services/FilecoinService';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/ApiError';

export class UserController {
  private userService: UserService;
  private ensService: ENSService;
  private filecoinService: FilecoinService;

  constructor() {
    this.userService = new UserService();
    this.ensService = new ENSService();
    this.filecoinService = new FilecoinService();
  }

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const { address } = req.params;
    const profile = await this.userService.getProfile(address);
    res.json(profile);
  });

  getStats = catchAsync(async (req: Request, res: Response) => {
    const { address } = req.params;
    const stats = await this.userService.getStats(address);
    res.json(stats);
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const { address } = req.user;
    const profileData = req.body;
    const updatedProfile = await this.userService.updateProfile(address, profileData);
    res.json(updatedProfile);
  });

  getBuddyList = catchAsync(async (req: Request, res: Response) => {
    const { address } = req.user;
    const buddies = await this.userService.getBuddyList(address);
    res.json(buddies);
  });

  verifyBuddy = catchAsync(async (req: Request, res: Response) => {
    const { address } = req.user;
    const { signature, ensName } = req.body;
    const result = await this.userService.verifyBuddy(address, signature, ensName);
    res.json(result);
  });
}

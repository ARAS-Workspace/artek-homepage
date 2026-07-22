// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 *  █████╗ ██████╗  █████╗ ███████╗
 * ██╔══██╗██╔══██╗██╔══██╗██╔════╝
 * ███████║██████╔╝███████║███████╗
 * ██╔══██║██╔══██╗██╔══██║╚════██║
 * ██║  ██║██║  ██║██║  ██║███████║
 * ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝
 *
 * Copyright (C) 2025 Rıza Emre ARAS <r.emrearas@proton.me>
 *
 * This file is part of ARTEK Homepage.
 *
 * ARTEK Homepage is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import type { GameConfig, GameMessages } from '../types';
import { GameState } from '../types';
import { GAME_AREA, CLOUD, GAME_CONFIG, LOOP, OBSTACLE } from '../constants';
import { Dino } from './Dino';
import { Obstacle } from './Obstacle';
import { Cloud } from './Cloud';
import { checkCollision, randomRange } from '../utils/collision';

export interface GameRenderState {
  state: GameState;
  score: number;
  messages: GameMessages;
  dino: { x: number; y: number; width: number; height: number };
  obstacles: Array<{ x: number; y: number; width: number; height: number; variantIndex: number }>;
  clouds: Array<{ x: number; y: number; width: number; height: number; variantIndex: number }>;
}

export interface VariantCounts {
  obstacle: number;
  cloud: number;
}

export class GameEngine {
  private dino: Dino;
  private obstacles: Obstacle[] = [];
  private clouds: Cloud[] = [];
  private readonly config: GameConfig;
  private state: GameState = GameState.WAITING;
  private score: number = 0;
  private distanceMeter: number = 0;
  private speed: number;
  private readonly messages: GameMessages;
  private readonly variantCounts: VariantCounts;
  private lastTime: number | null = null;
  private accumulator: number = 0;

  constructor(messages: GameMessages, variantCounts: VariantCounts) {
    this.messages = messages;
    this.variantCounts = variantCounts;

    this.config = { ...GAME_CONFIG };
    this.speed = this.config.speed;
    this.dino = new Dino(this.config);

    // Initialize with some clouds
    this.initClouds();
  }

  private initClouds(): void {
    for (let i = 0; i < 3; i++) {
      this.clouds.push(
        new Cloud(
          randomRange(0, GAME_AREA.WIDTH),
          randomRange(CLOUD.Y_MIN, CLOUD.Y_MAX),
          this.variantCounts.cloud
        )
      );
    }
  }

  start(): void {
    this.state = GameState.RUNNING;
  }

  reset(): void {
    this.state = GameState.WAITING;
    this.score = 0;
    this.distanceMeter = 0;
    this.speed = this.config.speed;
    this.obstacles = [];
    this.accumulator = 0;
    this.dino.reset();
  }

  jump(): void {
    if (this.state === GameState.WAITING) {
      this.start();
    }
    if (this.state === GameState.RUNNING) {
      this.dino.jump(this.config.jumpVelocity);
    }
    if (this.state === GameState.CRASHED) {
      this.reset();
    }
  }

  update(): void {
    // Fixed-timestep loop: advance physics in constant STEP_MS increments so the
    // simulation runs at the same speed on any display refresh rate. The caller
    // invokes update() once per animation frame; the wall-clock delta is measured
    // here and consumed in fixed steps.
    const now = performance.now();
    if (this.lastTime === null) this.lastTime = now;
    let delta = now - this.lastTime;
    this.lastTime = now;

    if (this.state !== GameState.RUNNING) return;

    // Clamp so a long pause (e.g. backgrounded tab) can't fast-forward the game.
    if (delta > LOOP.STEP_MS * LOOP.MAX_STEPS) delta = LOOP.STEP_MS * LOOP.MAX_STEPS;
    this.accumulator += delta;
    let steps = 0;
    while (this.accumulator >= LOOP.STEP_MS && steps < LOOP.MAX_STEPS) {
      this.step();
      this.accumulator -= LOOP.STEP_MS;
      steps++;
    }
  }

  private step(): void {
    // Update dino
    this.dino.update(this.config.gravity);

    // Update speed
    this.speed = Math.min(this.config.maxSpeed, this.speed + this.config.acceleration);

    // Update distance and score
    this.distanceMeter += this.speed;
    this.score = Math.floor(this.distanceMeter / 10);

    // Update obstacles
    this.obstacles.forEach((obstacle) => obstacle.update(this.speed));
    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.isOffScreen());

    // Spawn new obstacles
    if (
      this.obstacles.length === 0 ||
      this.obstacles[this.obstacles.length - 1].x <
        GAME_AREA.WIDTH - randomRange(OBSTACLE.GAP_MIN, OBSTACLE.GAP_MAX)
    ) {
      this.obstacles.push(new Obstacle(GAME_AREA.WIDTH, this.variantCounts.obstacle));
    }

    // Update clouds
    this.clouds.forEach((cloud) => cloud.update(this.speed));
    this.clouds = this.clouds.filter((cloud) => !cloud.isOffScreen());

    // Spawn new clouds
    if (
      this.clouds.length < 5 &&
      (this.clouds.length === 0 ||
        this.clouds[this.clouds.length - 1].x <
          GAME_AREA.WIDTH - randomRange(CLOUD.GAP_MIN, CLOUD.GAP_MAX))
    ) {
      this.clouds.push(
        new Cloud(GAME_AREA.WIDTH, randomRange(CLOUD.Y_MIN, CLOUD.Y_MAX), this.variantCounts.cloud)
      );
    }

    // Check collisions
    const dinoBB = this.dino.getBoundingBox();
    for (const obstacle of this.obstacles) {
      if (checkCollision(dinoBB, obstacle.getBoundingBox())) {
        this.state = GameState.CRASHED;
        break;
      }
    }
  }

  getState(): GameRenderState {
    return {
      state: this.state,
      score: this.score,
      messages: this.messages,
      dino: {
        x: this.dino.getBoundingBox().x,
        y: this.dino.getBoundingBox().y,
        width: OBSTACLE.WIDTH,
        height: OBSTACLE.HEIGHT,
      },
      obstacles: this.obstacles.map((obs) => ({
        x: obs.x,
        y: obs.getBoundingBox().y,
        width: OBSTACLE.WIDTH,
        height: OBSTACLE.HEIGHT,
        variantIndex: obs.variantIndex,
      })),
      clouds: this.clouds.map((cloud) => ({
        x: cloud.x,
        y: cloud.getBoundingBox().y,
        width: CLOUD.WIDTH,
        height: CLOUD.HEIGHT,
        variantIndex: cloud.variantIndex,
      })),
    };
  }
}
